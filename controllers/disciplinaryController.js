// controllers/disciplinaryController.js
// Handles disciplinary cases, hearings, warnings, and grievances

const Disciplinary = require("../models/Disciplinary");
const Employee = require("../models/Employee");
const asyncHandler = require("../utils/asyncHandler");
const ErrorHandler = require("../utils/errorHandler");

// @desc    Get all disciplinary cases
// @route   GET /api/disciplinary
// @access  Super Admin, HR Manager
exports.getDisciplinaryCases = asyncHandler(async (req, res) => {
  const { status, type, employeeId } = req.query;

  const filter = {};
  if (status) filter.status = status;
  if (type) filter.type = type;
  if (employeeId) filter.employee = employeeId;

  const cases = await Disciplinary.find(filter)
    .populate("employee", "firstName lastName employeeCode department photo")
    .populate("handledBy", "email")
    .populate("resolvedBy", "email")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: cases.length,
    cases,
  });
});

// @desc    Get single disciplinary case
// @route   GET /api/disciplinary/:id
// @access  Super Admin, HR Manager
exports.getDisciplinaryCase = asyncHandler(async (req, res, next) => {
  const case_ = await Disciplinary.findById(req.params.id)
    .populate({
      path: "employee",
      select: "firstName lastName employeeCode department position photo",
      populate: [
        { path: "department", select: "name" },
        { path: "position", select: "title" },
      ],
    })
    .populate("handledBy", "email")
    .populate("resolvedBy", "email");

  if (!case_) {
    return next(new ErrorHandler("Disciplinary case not found.", 404));
  }

  res.status(200).json({ success: true, case: case_ });
});

// @desc    Create disciplinary case
// @route   POST /api/disciplinary
// @access  Super Admin, HR Manager
exports.createCase = asyncHandler(async (req, res, next) => {
  const { employeeId, type, incidentDate, description, warningLevel } =
    req.body;

  if (!employeeId || !type || !incidentDate || !description) {
    return next(
      new ErrorHandler(
        "Employee, type, incident date, and description are required.",
        400,
      ),
    );
  }

  const employee = await Employee.findById(employeeId);
  if (!employee) {
    return next(new ErrorHandler("Employee not found.", 404));
  }

  // Handle evidence file uploads
  const evidenceFiles = req.files
    ? req.files.map((f) => `/uploads/documents/${f.filename}`)
    : [];

  const disciplinaryCase = await Disciplinary.create({
    employee: employeeId,
    type,
    incidentDate,
    description,
    warningLevel: warningLevel || "",
    evidenceFiles,
    handledBy: req.user._id,
    status: "Open",
  });

  await disciplinaryCase.populate(
    "employee",
    "firstName lastName employeeCode",
  );

  res.status(201).json({
    success: true,
    message: `Disciplinary case opened for ${employee.firstName} ${employee.lastName}.`,
    case: disciplinaryCase,
  });
});

// @desc    Update disciplinary case (add hearing notes, outcome, etc.)
// @route   PUT /api/disciplinary/:id
// @access  Super Admin, HR Manager
exports.updateCase = asyncHandler(async (req, res, next) => {
  const case_ = await Disciplinary.findById(req.params.id);

  if (!case_) {
    return next(new ErrorHandler("Disciplinary case not found.", 404));
  }

  if (case_.status === "Closed") {
    return next(new ErrorHandler("Cannot update a closed case.", 400));
  }

  const updated = await Disciplinary.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true },
  ).populate("employee", "firstName lastName employeeCode");

  res.status(200).json({
    success: true,
    message: "Case updated.",
    case: updated,
  });
});

// @desc    Schedule or record hearing
// @route   PUT /api/disciplinary/:id/hearing
// @access  Super Admin, HR Manager
exports.recordHearing = asyncHandler(async (req, res, next) => {
  const { hearingDate, hearingNotes, outcome } = req.body;

  const case_ = await Disciplinary.findById(req.params.id);
  if (!case_) {
    return next(new ErrorHandler("Disciplinary case not found.", 404));
  }

  case_.hearingDate = hearingDate || case_.hearingDate;
  case_.hearingNotes = hearingNotes || case_.hearingNotes;
  case_.outcome = outcome || case_.outcome;
  case_.status = "Under Review";

  await case_.save();

  res.status(200).json({
    success: true,
    message: "Hearing details recorded.",
    case: case_,
  });
});

// @desc    Resolve disciplinary case
// @route   PUT /api/disciplinary/:id/resolve
// @access  Super Admin, HR Manager
exports.resolveCase = asyncHandler(async (req, res, next) => {
  const { outcome, warningLevel, letterFileUrl } = req.body;

  const case_ = await Disciplinary.findById(req.params.id);
  if (!case_) {
    return next(new ErrorHandler("Disciplinary case not found.", 404));
  }

  if (case_.status === "Resolved" || case_.status === "Closed") {
    return next(
      new ErrorHandler("This case is already resolved or closed.", 400),
    );
  }

  case_.outcome = outcome || case_.outcome;
  case_.warningLevel = warningLevel || case_.warningLevel;
  case_.letterFileUrl = letterFileUrl || case_.letterFileUrl;
  case_.status = "Resolved";
  case_.resolvedAt = new Date();
  case_.resolvedBy = req.user._id;

  await case_.save();

  await case_.populate("employee", "firstName lastName employeeCode");

  res.status(200).json({
    success: true,
    message: `Case resolved for ${case_.employee.firstName} ${case_.employee.lastName}.`,
    case: case_,
  });
});

// @desc    Close disciplinary case
// @route   PUT /api/disciplinary/:id/close
// @access  Super Admin
exports.closeCase = asyncHandler(async (req, res, next) => {
  const case_ = await Disciplinary.findById(req.params.id);

  if (!case_) {
    return next(new ErrorHandler("Disciplinary case not found.", 404));
  }

  case_.status = "Closed";
  await case_.save();

  res.status(200).json({
    success: true,
    message: "Case closed.",
    case: case_,
  });
});

// @desc    Get disciplinary stats
// @route   GET /api/disciplinary/stats
// @access  Super Admin, HR Manager
exports.getDisciplinaryStats = asyncHandler(async (req, res) => {
  const [total, open, underReview, resolved, closed, byType] =
    await Promise.all([
      Disciplinary.countDocuments(),
      Disciplinary.countDocuments({ status: "Open" }),
      Disciplinary.countDocuments({ status: "Under Review" }),
      Disciplinary.countDocuments({ status: "Resolved" }),
      Disciplinary.countDocuments({ status: "Closed" }),
      Disciplinary.aggregate([
        { $group: { _id: "$type", count: { $sum: 1 } } },
      ]),
    ]);

  res.status(200).json({
    success: true,
    stats: { total, open, underReview, resolved, closed, byType },
  });
});
