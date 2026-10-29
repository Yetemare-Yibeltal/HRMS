// controllers/recruitmentController.js
// Handles the full recruitment lifecycle:
// job postings, applicant tracking, interviews, offer letters, and hiring

const { JobPosting, Applicant } = require("../models/Recruitment");
const Employee = require("../models/Employee");
const Department = require("../models/Department");
const Position = require("../models/Position");
const asyncHandler = require("../utils/asyncHandler");
const ErrorHandler = require("../utils/errorHandler");

// ─────────────────────────────────────────────────────────────────────────────
// JOB POSTINGS
// ─────────────────────────────────────────────────────────────────────────────

// @desc    Get all job postings
// @route   GET /api/recruitment/jobs
// @access  Private
exports.getJobPostings = asyncHandler(async (req, res) => {
  const { status, department, type } = req.query;

  const filter = {};
  if (status) filter.status = status;
  if (department) filter.department = department;
  if (type) filter.type = type;

  const jobs = await JobPosting.find(filter)
    .populate("department", "name code")
    .populate("position", "title grade")
    .populate("postedBy", "email")
    .sort({ createdAt: -1 });

  // Add applicant count to each job
  const jobsWithCount = await Promise.all(
    jobs.map(async (job) => {
      const count = await Applicant.countDocuments({ jobPosting: job._id });
      return { ...job.toJSON(), applicantCount: count };
    }),
  );

  res.status(200).json({
    success: true,
    count: jobs.length,
    jobs: jobsWithCount,
  });
});

// @desc    Get single job posting
// @route   GET /api/recruitment/jobs/:id
// @access  Private
exports.getJobPosting = asyncHandler(async (req, res, next) => {
  const job = await JobPosting.findById(req.params.id)
    .populate("department", "name code")
    .populate("position", "title grade minSalary maxSalary")
    .populate("postedBy", "email");

  if (!job) {
    return next(new ErrorHandler("Job posting not found.", 404));
  }

  // Get all applicants for this job
  const applicants = await Applicant.find({ jobPosting: job._id }).sort({
    createdAt: -1,
  });

  res.status(200).json({
    success: true,
    job: { ...job.toJSON(), applicants },
  });
});

// @desc    Create job posting
// @route   POST /api/recruitment/jobs
// @access  Super Admin, HR Manager
exports.createJobPosting = asyncHandler(async (req, res, next) => {
  const {
    title,
    department,
    position,
    description,
    requirements,
    vacancies,
    type,
    closingDate,
  } = req.body;

  // Validate required fields
  if (!title || !department || !closingDate) {
    return next(
      new ErrorHandler(
        "Title, department, and closing date are required.",
        400,
      ),
    );
  }

  // Verify closing date is in the future
  if (new Date(closingDate) <= new Date()) {
    return next(new ErrorHandler("Closing date must be in the future.", 400));
  }

  const job = await JobPosting.create({
    title,
    department,
    position: position || null,
    description: description || "",
    requirements: requirements || [],
    vacancies: vacancies || 1,
    type: type || "Both",
    closingDate,
    postedBy: req.user._id,
    status: "Draft",
  });

  await job.populate("department", "name code");

  res.status(201).json({
    success: true,
    message: "Job posting created as draft.",
    job,
  });
});

// @desc    Update job posting
// @route   PUT /api/recruitment/jobs/:id
// @access  Super Admin, HR Manager
exports.updateJobPosting = asyncHandler(async (req, res, next) => {
  const job = await JobPosting.findById(req.params.id);

  if (!job) {
    return next(new ErrorHandler("Job posting not found.", 404));
  }

  // Cannot edit a closed or cancelled posting
  if (["Closed", "Cancelled"].includes(job.status)) {
    return next(
      new ErrorHandler(`Cannot edit a ${job.status} job posting.`, 400),
    );
  }

  const updated = await JobPosting.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  })
    .populate("department", "name code")
    .populate("position", "title grade");

  res.status(200).json({
    success: true,
    message: "Job posting updated.",
    job: updated,
  });
});

// @desc    Publish a draft job posting
// @route   PUT /api/recruitment/jobs/:id/publish
// @access  Super Admin, HR Manager
exports.publishJobPosting = asyncHandler(async (req, res, next) => {
  const job = await JobPosting.findById(req.params.id);

  if (!job) {
    return next(new ErrorHandler("Job posting not found.", 404));
  }

  if (job.status !== "Draft") {
    return next(new ErrorHandler(`Job is already ${job.status}.`, 400));
  }

  job.status = "Published";
  job.postingDate = new Date();
  await job.save();

  res.status(200).json({
    success: true,
    message: "Job posting published successfully.",
    job,
  });
});

// @desc    Close a job posting
// @route   PUT /api/recruitment/jobs/:id/close
// @access  Super Admin, HR Manager
exports.closeJobPosting = asyncHandler(async (req, res, next) => {
  const job = await JobPosting.findById(req.params.id);

  if (!job) {
    return next(new ErrorHandler("Job posting not found.", 404));
  }

  job.status = "Closed";
  await job.save();

  res.status(200).json({
    success: true,
    message: "Job posting closed.",
    job,
  });
});

// @desc    Delete job posting
// @route   DELETE /api/recruitment/jobs/:id
// @access  Super Admin
exports.deleteJobPosting = asyncHandler(async (req, res, next) => {
  const job = await JobPosting.findById(req.params.id);

  if (!job) {
    return next(new ErrorHandler("Job posting not found.", 404));
  }

  // Check if there are applicants already
  const applicantCount = await Applicant.countDocuments({
    jobPosting: job._id,
  });
  if (applicantCount > 0) {
    return next(
      new ErrorHandler(
        `Cannot delete. This job has ${applicantCount} applicant(s).`,
        400,
      ),
    );
  }

  await job.deleteOne();

  res.status(200).json({
    success: true,
    message: "Job posting deleted.",
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// APPLICANTS
// ─────────────────────────────────────────────────────────────────────────────

// @desc    Get all applicants (with filters)
// @route   GET /api/recruitment/applicants
// @access  Super Admin, HR Manager
exports.getApplicants = asyncHandler(async (req, res) => {
  const { jobPosting, status } = req.query;

  const filter = {};
  if (jobPosting) filter.jobPosting = jobPosting;
  if (status) filter.status = status;

  const applicants = await Applicant.find(filter)
    .populate({
      path: "jobPosting",
      select: "title department closingDate",
      populate: { path: "department", select: "name" },
    })
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: applicants.length,
    applicants,
  });
});

// @desc    Get single applicant
// @route   GET /api/recruitment/applicants/:id
// @access  Super Admin, HR Manager
exports.getApplicant = asyncHandler(async (req, res, next) => {
  const applicant = await Applicant.findById(req.params.id)
    .populate({
      path: "jobPosting",
      populate: [
        { path: "department", select: "name code" },
        { path: "position", select: "title grade" },
      ],
    })
    .populate("interview.interviewers", "firstName lastName employeeCode");

  if (!applicant) {
    return next(new ErrorHandler("Applicant not found.", 404));
  }

  res.status(200).json({ success: true, applicant });
});

// @desc    Submit job application
// @route   POST /api/recruitment/applicants
// @access  Public (external applicants) or Private (internal)
exports.submitApplication = asyncHandler(async (req, res, next) => {
  const { jobPostingId, firstName, lastName, email, phone, coverLetter } =
    req.body;

  if (!jobPostingId || !firstName || !lastName || !email) {
    return next(new ErrorHandler("Job ID, name, and email are required.", 400));
  }

  // Verify job exists and is still open
  const job = await JobPosting.findById(jobPostingId);
  if (!job) {
    return next(new ErrorHandler("Job posting not found.", 404));
  }

  if (job.status !== "Published") {
    return next(
      new ErrorHandler(
        "This job posting is no longer accepting applications.",
        400,
      ),
    );
  }

  // Check closing date
  if (new Date(job.closingDate) < new Date()) {
    return next(new ErrorHandler("The application deadline has passed.", 400));
  }

  // Prevent duplicate applications from same email
  const duplicate = await Applicant.findOne({
    jobPosting: jobPostingId,
    email: email.toLowerCase(),
  });
  if (duplicate) {
    return next(
      new ErrorHandler(
        "An application with this email already exists for this job.",
        400,
      ),
    );
  }

  // Handle resume upload
  const resumeUrl = req.file ? `/uploads/resumes/${req.file.filename}` : "";

  const applicant = await Applicant.create({
    jobPosting: jobPostingId,
    firstName,
    lastName,
    email: email.toLowerCase(),
    phone: phone || "",
    coverLetter: coverLetter || "",
    resumeUrl,
    status: "Applied",
  });

  res.status(201).json({
    success: true,
    message: "Application submitted successfully.",
    applicant,
  });
});

// @desc    Update applicant status (shortlist, reject, etc.)
// @route   PUT /api/recruitment/applicants/:id/status
// @access  Super Admin, HR Manager
exports.updateApplicantStatus = asyncHandler(async (req, res, next) => {
  const { status } = req.body;

  const validStatuses = [
    "Applied",
    "Shortlisted",
    "Interview Scheduled",
    "Offered",
    "Hired",
    "Rejected",
  ];

  if (!validStatuses.includes(status)) {
    return next(new ErrorHandler("Invalid status value.", 400));
  }

  const applicant = await Applicant.findById(req.params.id);
  if (!applicant) {
    return next(new ErrorHandler("Applicant not found.", 404));
  }

  applicant.status = status;
  await applicant.save();

  res.status(200).json({
    success: true,
    message: `Applicant status updated to ${status}.`,
    applicant,
  });
});

// @desc    Schedule interview for applicant
// @route   PUT /api/recruitment/applicants/:id/schedule-interview
// @access  Super Admin, HR Manager
exports.scheduleInterview = asyncHandler(async (req, res, next) => {
  const { date, location, interviewers, feedback, score, result } = req.body;

  const applicant = await Applicant.findById(req.params.id);
  if (!applicant) {
    return next(new ErrorHandler("Applicant not found.", 404));
  }

  // Update interview details
  applicant.interview = {
    date: date || null,
    location: location || "",
    interviewers: interviewers || [],
    feedback: feedback || "",
    score: score || null,
    result: result || "Pending",
  };

  // Update status to reflect interview is scheduled
  if (date && !feedback) {
    applicant.status = "Interview Scheduled";
  }

  // If interview result is provided update status accordingly
  if (result === "Pass") {
    applicant.status = "Shortlisted";
  } else if (result === "Fail") {
    applicant.status = "Rejected";
  }

  await applicant.save();

  res.status(200).json({
    success: true,
    message: "Interview details updated.",
    applicant,
  });
});

// @desc    Send offer letter to applicant
// @route   PUT /api/recruitment/applicants/:id/offer
// @access  Super Admin, HR Manager
exports.sendOffer = asyncHandler(async (req, res, next) => {
  const { salary, startDate, offerDate } = req.body;

  if (!salary || !startDate) {
    return next(
      new ErrorHandler("Salary and start date are required for offer.", 400),
    );
  }

  const applicant = await Applicant.findById(req.params.id);
  if (!applicant) {
    return next(new ErrorHandler("Applicant not found.", 404));
  }

  // Only shortlisted applicants can receive an offer
  if (!["Shortlisted", "Interview Scheduled"].includes(applicant.status)) {
    return next(
      new ErrorHandler(
        "Applicant must be shortlisted before sending an offer.",
        400,
      ),
    );
  }

  // Handle offer letter file upload
  const offerFileUrl = req.file
    ? `/uploads/documents/${req.file.filename}`
    : "";

  applicant.offer = {
    salary,
    startDate,
    offerDate: offerDate || new Date(),
    offerStatus: "Pending",
    offerFileUrl,
  };

  applicant.status = "Offered";
  await applicant.save();

  res.status(200).json({
    success: true,
    message: "Offer sent to applicant.",
    applicant,
  });
});

// @desc    Accept or decline offer
// @route   PUT /api/recruitment/applicants/:id/offer-response
// @access  Super Admin, HR Manager
exports.offerResponse = asyncHandler(async (req, res, next) => {
  const { response } = req.body;
  // response must be 'Accepted' or 'Declined'

  if (!["Accepted", "Declined"].includes(response)) {
    return next(
      new ErrorHandler("Response must be Accepted or Declined.", 400),
    );
  }

  const applicant = await Applicant.findById(req.params.id);
  if (!applicant) {
    return next(new ErrorHandler("Applicant not found.", 404));
  }

  if (applicant.status !== "Offered") {
    return next(
      new ErrorHandler("No pending offer found for this applicant.", 400),
    );
  }

  applicant.offer.offerStatus = response;

  if (response === "Accepted") {
    // Mark as hired — onboarding can begin
    applicant.status = "Hired";
  } else {
    applicant.status = "Rejected";
  }

  await applicant.save();

  res.status(200).json({
    success: true,
    message: `Offer ${response.toLowerCase()} by applicant.`,
    applicant,
  });
});

// @desc    Convert hired applicant to employee (trigger onboarding)
// @route   POST /api/recruitment/applicants/:id/hire
// @access  Super Admin, HR Manager
exports.hireApplicant = asyncHandler(async (req, res, next) => {
  const {
    department,
    position,
    employmentType,
    dateOfJoining,
    basicSalary,
    salaryGrade,
  } = req.body;

  const applicant = await Applicant.findById(req.params.id).populate(
    "jobPosting",
  );

  if (!applicant) {
    return next(new ErrorHandler("Applicant not found.", 404));
  }

  if (applicant.status !== "Hired") {
    return next(
      new ErrorHandler(
        "Applicant must have accepted the offer before being hired.",
        400,
      ),
    );
  }

  // Check if already converted to employee
  const alreadyEmployee = await Employee.findOne({
    personalEmail: applicant.email,
  });
  if (alreadyEmployee) {
    return next(
      new ErrorHandler(
        "This applicant has already been converted to an employee.",
        400,
      ),
    );
  }

  // Import employee code generator
  const generateEmployeeCode = require("../utils/generateEmployeeCode");
  const employeeCode = await generateEmployeeCode();

  // Create employee from applicant data
  const nameParts = applicant.firstName.split(" ");
  const employee = await Employee.create({
    employeeCode,
    firstName: applicant.firstName,
    lastName: applicant.lastName,
    personalEmail: applicant.email,
    phone: applicant.phone || "",
    department: department || applicant.jobPosting?.department,
    position: position || applicant.jobPosting?.position || null,
    employmentType: employmentType || "Permanent",
    dateOfJoining: dateOfJoining || applicant.offer?.startDate || new Date(),
    basicSalary: basicSalary || applicant.offer?.salary || 0,
    salaryGrade: salaryGrade || "",
    status: "Active",
  });

  // Close the job posting if all vacancies are filled
  const job = await JobPosting.findById(applicant.jobPosting._id);
  const hiredCount = await Applicant.countDocuments({
    jobPosting: job._id,
    status: "Hired",
  });

  if (hiredCount >= job.vacancies) {
    job.status = "Closed";
    await job.save();
  }

  res.status(201).json({
    success: true,
    message: `Applicant hired as employee ${employeeCode}. Onboarding can now begin.`,
    employee,
  });
});

// @desc    Get recruitment dashboard stats
// @route   GET /api/recruitment/stats
// @access  Super Admin, HR Manager
exports.getRecruitmentStats = asyncHandler(async (req, res) => {
  const [totalJobs, openJobs, totalApplicants, shortlisted, hired, rejected] =
    await Promise.all([
      JobPosting.countDocuments(),
      JobPosting.countDocuments({ status: "Published" }),
      Applicant.countDocuments(),
      Applicant.countDocuments({ status: "Shortlisted" }),
      Applicant.countDocuments({ status: "Hired" }),
      Applicant.countDocuments({ status: "Rejected" }),
    ]);

  // Applications per job
  const applicationsByJob = await Applicant.aggregate([
    {
      $group: {
        _id: "$jobPosting",
        count: { $sum: 1 },
      },
    },
    {
      $lookup: {
        from: "jobpostings",
        localField: "_id",
        foreignField: "_id",
        as: "job",
      },
    },
    { $unwind: "$job" },
    {
      $project: {
        jobTitle: "$job.title",
        count: 1,
      },
    },
    { $sort: { count: -1 } },
    { $limit: 5 }, // top 5 jobs
  ]);

  res.status(200).json({
    success: true,
    stats: {
      totalJobs,
      openJobs,
      totalApplicants,
      shortlisted,
      hired,
      rejected,
      applicationsByJob,
    },
  });
});
