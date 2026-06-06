// controllers/trainingController.js
// Handles training programs, nominations, attendance tracking,
// and certification management

const Training = require("../models/Training");
const Employee = require("../models/Employee");
const asyncHandler = require("../utils/asyncHandler");
const ErrorHandler = require("../utils/errorHandler");

// ─────────────────────────────────────────────────────────────────────────────
// TRAINING PROGRAMS
// ─────────────────────────────────────────────────────────────────────────────

// @desc    Get all training programs
// @route   GET /api/training
// @access  Private
exports.getTrainings = asyncHandler(async (req, res) => {
  const { status, type, year } = req.query;

  const filter = {};
  if (status) filter.status = status;
  if (type) filter.type = type;

  // Filter by year
  if (year) {
    filter.startDate = {
      $gte: new Date(`${year}-01-01`),
      $lte: new Date(`${year}-12-31`),
    };
  }

  const trainings = await Training.find(filter)
    .populate("createdBy", "email")
    .sort({ startDate: -1 });

  // Add participant count to each training
  const trainingsWithCount = trainings.map((t) => ({
    ...t.toJSON(),
    participantCount: t.participants.length,
  }));

  res.status(200).json({
    success: true,
    count: trainings.length,
    trainings: trainingsWithCount,
  });
});

// @desc    Get single training program
// @route   GET /api/training/:id
// @access  Private
exports.getTraining = asyncHandler(async (req, res, next) => {
  const training = await Training.findById(req.params.id)
    .populate("createdBy", "email")
    .populate(
      "participants.employee",
      "firstName lastName employeeCode department photo",
    );

  if (!training) {
    return next(new ErrorHandler("Training program not found.", 404));
  }

  res.status(200).json({ success: true, training });
});

// @desc    Create training program
// @route   POST /api/training
// @access  Super Admin, HR Manager
exports.createTraining = asyncHandler(async (req, res, next) => {
  const {
    title,
    description,
    type,
    provider,
    venue,
    startDate,
    endDate,
    duration,
    maxParticipants,
    cost,
  } = req.body;

  if (!title || !startDate || !endDate) {
    return next(
      new ErrorHandler("Title, start date and end date are required.", 400),
    );
  }

  // End date must be after start date
  if (new Date(endDate) < new Date(startDate)) {
    return next(new ErrorHandler("End date cannot be before start date.", 400));
  }

  const training = await Training.create({
    title,
    description: description || "",
    type: type || "Workshop",
    provider: provider || "Internal",
    venue: venue || "",
    startDate,
    endDate,
    duration: duration || 0,
    maxParticipants: maxParticipants || 30,
    cost: cost || 0,
    createdBy: req.user._id,
    status: "Planned",
  });

  res.status(201).json({
    success: true,
    message: "Training program created.",
    training,
  });
});

// @desc    Update training program
// @route   PUT /api/training/:id
// @access  Super Admin, HR Manager
exports.updateTraining = asyncHandler(async (req, res, next) => {
  const training = await Training.findById(req.params.id);

  if (!training) {
    return next(new ErrorHandler("Training program not found.", 404));
  }

  if (training.status === "Completed") {
    return next(
      new ErrorHandler("Cannot edit a completed training program.", 400),
    );
  }

  const updated = await Training.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    message: "Training program updated.",
    training: updated,
  });
});

// @desc    Delete training program
// @route   DELETE /api/training/:id
// @access  Super Admin
exports.deleteTraining = asyncHandler(async (req, res, next) => {
  const training = await Training.findById(req.params.id);

  if (!training) {
    return next(new ErrorHandler("Training program not found.", 404));
  }

  // Cannot delete if it has participants
  if (training.participants.length > 0) {
    return next(
      new ErrorHandler(
        `Cannot delete. ${training.participants.length} employee(s) are nominated.`,
        400,
      ),
    );
  }

  await training.deleteOne();

  res.status(200).json({
    success: true,
    message: "Training program deleted.",
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// NOMINATIONS & PARTICIPATION
// ─────────────────────────────────────────────────────────────────────────────

// @desc    Nominate employee(s) for a training
// @route   POST /api/training/:id/nominate
// @access  Super Admin, HR Manager, HOD
exports.nominateEmployees = asyncHandler(async (req, res, next) => {
  const { employeeIds } = req.body;
  // employeeIds = array of employee IDs to nominate

  if (!employeeIds || employeeIds.length === 0) {
    return next(new ErrorHandler("At least one employee ID is required.", 400));
  }

  const training = await Training.findById(req.params.id);
  if (!training) {
    return next(new ErrorHandler("Training program not found.", 404));
  }

  if (training.status === "Completed" || training.status === "Cancelled") {
    return next(
      new ErrorHandler(
        `Cannot nominate for a ${training.status} training.`,
        400,
      ),
    );
  }

  // Check max participants limit
  const currentCount = training.participants.length;
  const remaining = training.maxParticipants - currentCount;

  if (employeeIds.length > remaining) {
    return next(
      new ErrorHandler(
        `Only ${remaining} spot(s) remaining in this training.`,
        400,
      ),
    );
  }

  const nominated = [];
  const skipped = [];

  for (const empId of employeeIds) {
    // Check if already nominated
    const alreadyNominated = training.participants.find(
      (p) => p.employee.toString() === empId,
    );

    if (alreadyNominated) {
      skipped.push(empId);
      continue;
    }

    // Verify employee exists
    const employee = await Employee.findById(empId);
    if (!employee) {
      skipped.push(empId);
      continue;
    }

    training.participants.push({
      employee: empId,
      status: "Nominated",
    });

    nominated.push(empId);
  }

  await training.save();

  res.status(200).json({
    success: true,
    message: `${nominated.length} employee(s) nominated. ${skipped.length} skipped.`,
    nominated,
    skipped,
  });
});

// @desc    Update participant status (approve, mark attended, complete)
// @route   PUT /api/training/:id/participants/:employeeId
// @access  Super Admin, HR Manager
exports.updateParticipantStatus = asyncHandler(async (req, res, next) => {
  const { status, score, certificateUrl } = req.body;

  const training = await Training.findById(req.params.id);
  if (!training) {
    return next(new ErrorHandler("Training program not found.", 404));
  }

  // Find the participant in the training
  const participant = training.participants.find(
    (p) => p.employee.toString() === req.params.employeeId,
  );

  if (!participant) {
    return next(
      new ErrorHandler("Employee is not nominated for this training.", 404),
    );
  }

  // Update participant details
  if (status) participant.status = status;
  if (score !== undefined) participant.score = score;
  if (certificateUrl) participant.certificateUrl = certificateUrl;

  // Set completion date if status is Completed
  if (status === "Completed") {
    participant.completedAt = new Date();
  }

  await training.save();

  res.status(200).json({
    success: true,
    message: `Participant status updated to ${status}.`,
    participant,
  });
});

// @desc    Update training program status
// @route   PUT /api/training/:id/status
// @access  Super Admin, HR Manager
exports.updateTrainingStatus = asyncHandler(async (req, res, next) => {
  const { status } = req.body;

  const validStatuses = ["Planned", "Ongoing", "Completed", "Cancelled"];
  if (!validStatuses.includes(status)) {
    return next(new ErrorHandler("Invalid status value.", 400));
  }

  const training = await Training.findById(req.params.id);
  if (!training) {
    return next(new ErrorHandler("Training program not found.", 404));
  }

  training.status = status;

  // If completing, mark all Attended participants as Completed
  if (status === "Completed") {
    training.participants.forEach((p) => {
      if (p.status === "Attended") {
        p.status = "Completed";
        p.completedAt = new Date();
      }
    });
  }

  await training.save();

  res.status(200).json({
    success: true,
    message: `Training status updated to ${status}.`,
    training,
  });
});

// @desc    Get training stats for dashboard
// @route   GET /api/training/stats
// @access  Super Admin, HR Manager
exports.getTrainingStats = asyncHandler(async (req, res) => {
  const { year } = req.query;
  const currentYear = year || new Date().getFullYear();

  const [total, planned, ongoing, completed, cancelled] = await Promise.all([
    Training.countDocuments({
      startDate: {
        $gte: new Date(`${currentYear}-01-01`),
        $lte: new Date(`${currentYear}-12-31`),
      },
    }),
    Training.countDocuments({ status: "Planned" }),
    Training.countDocuments({ status: "Ongoing" }),
    Training.countDocuments({ status: "Completed" }),
    Training.countDocuments({ status: "Cancelled" }),
  ]);

  // Total participants across all trainings this year
  const participantStats = await Training.aggregate([
    {
      $match: {
        startDate: {
          $gte: new Date(`${currentYear}-01-01`),
          $lte: new Date(`${currentYear}-12-31`),
        },
      },
    },
    {
      $project: {
        participantCount: { $size: "$participants" },
        completedCount: {
          $size: {
            $filter: {
              input: "$participants",
              cond: { $eq: ["$$this.status", "Completed"] },
            },
          },
        },
      },
    },
    {
      $group: {
        _id: null,
        totalParticipants: { $sum: "$participantCount" },
        totalCompleted: { $sum: "$completedCount" },
      },
    },
  ]);

  const pStats = participantStats[0] || {
    totalParticipants: 0,
    totalCompleted: 0,
  };

  res.status(200).json({
    success: true,
    year: currentYear,
    stats: {
      total,
      planned,
      ongoing,
      completed,
      cancelled,
      totalParticipants: pStats.totalParticipants,
      totalCompleted: pStats.totalCompleted,
    },
  });
});
