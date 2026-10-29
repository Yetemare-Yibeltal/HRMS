// controllers/positionController.js
// Full CRUD for job positions/titles within departments.

const Position = require("../models/Position");
const Employee = require("../models/Employee");
const asyncHandler = require("../utils/asyncHandler");
const ErrorHandler = require("../utils/errorHandler");

// ── @desc    Get all positions
// ── @route   GET /api/positions
// ── @access  Private
exports.getPositions = asyncHandler(async (req, res) => {
  // Filter by department if query param provided
  // e.g. GET /api/positions?department=<id>
  const filter = {};
  if (req.query.department) {
    filter.department = req.query.department;
  }

  const positions = await Position.find(filter)
    .populate("department", "name code")
    .sort({ title: 1 });

  res.status(200).json({
    success: true,
    count: positions.length,
    positions,
  });
});

// ── @desc    Get single position
// ── @route   GET /api/positions/:id
// ── @access  Private
exports.getPosition = asyncHandler(async (req, res, next) => {
  const position = await Position.findById(req.params.id).populate(
    "department",
    "name code",
  );

  if (!position) {
    return next(new ErrorHandler("Position not found.", 404));
  }

  res.status(200).json({ success: true, position });
});

// ── @desc    Create position
// ── @route   POST /api/positions
// ── @access  Super Admin, HR Manager
exports.createPosition = asyncHandler(async (req, res) => {
  const position = await Position.create(req.body);

  res.status(201).json({
    success: true,
    message: "Position created successfully.",
    position,
  });
});

// ── @desc    Update position
// ── @route   PUT /api/positions/:id
// ── @access  Super Admin, HR Manager
exports.updatePosition = asyncHandler(async (req, res, next) => {
  let position = await Position.findById(req.params.id);

  if (!position) {
    return next(new ErrorHandler("Position not found.", 404));
  }

  position = await Position.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    message: "Position updated successfully.",
    position,
  });
});

// ── @desc    Delete position
// ── @route   DELETE /api/positions/:id
// ── @access  Super Admin
exports.deletePosition = asyncHandler(async (req, res, next) => {
  const position = await Position.findById(req.params.id);

  if (!position) {
    return next(new ErrorHandler("Position not found.", 404));
  }

  // Prevent deletion if employees hold this position
  const count = await Employee.countDocuments({ position: req.params.id });
  if (count > 0) {
    return next(
      new ErrorHandler(
        `Cannot delete. ${count} employee(s) hold this position.`,
        400,
      ),
    );
  }

  await position.deleteOne();

  res.status(200).json({
    success: true,
    message: "Position deleted successfully.",
  });
});
