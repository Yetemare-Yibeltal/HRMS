// controllers/appraisalController.js
// Handles the full performance appraisal cycle:
// creation, goal setting, self appraisal, manager review,
// HR moderation, final scoring, and rating

const Appraisal = require("../models/Appraisal");
const Employee = require("../models/Employee");
const asyncHandler = require("../utils/asyncHandler");
const ErrorHandler = require("../utils/errorHandler");

// ─────────────────────────────────────────────────────────────────────────────
// HELPER: Calculate final score from goals
// ─────────────────────────────────────────────────────────────────────────────

// Calculates weighted average of all goal scores
// Each goal has a weight percentage and manager score
const calculateFinalScore = (goals) => {
  if (!goals || goals.length === 0) return 0;

  // Check if all goals have manager scores
  const scoredGoals = goals.filter(
    (g) => g.managerScore !== null && g.managerScore !== undefined,
  );
  if (scoredGoals.length === 0) return 0;

  // Calculate total weight of scored goals
  const totalWeight = scoredGoals.reduce((sum, g) => sum + (g.weight || 0), 0);
  if (totalWeight === 0) return 0;

  // Weighted average formula: sum(score * weight) / totalWeight
  const weightedSum = scoredGoals.reduce(
    (sum, g) => sum + (g.managerScore || 0) * (g.weight || 0),
    0,
  );

  return parseFloat((weightedSum / totalWeight).toFixed(2));
};

// Converts a numeric score to a rating label
const scoreToRating = (score) => {
  if (score >= 90) return "Excellent";
  if (score >= 75) return "Very Good";
  if (score >= 60) return "Good";
  if (score >= 45) return "Needs Improvement";
  return "Unsatisfactory";
};

// ─────────────────────────────────────────────────────────────────────────────
// APPRAISAL MANAGEMENT
// ─────────────────────────────────────────────────────────────────────────────

// @desc    Get all appraisals with filters
// @route   GET /api/appraisals
// @access  Super Admin, HR Manager, HOD
exports.getAppraisals = asyncHandler(async (req, res) => {
  const { status, year, type, employeeId, department } = req.query;

  const filter = {};

  // Employees only see their own appraisals
  if (req.user.role === "employee") {
    filter.employee = req.user.employee?._id;
  } else if (employeeId) {
    filter.employee = employeeId;
  }

  // HOD only sees appraisals for their department employees
  if (req.user.role === "hod") {
    const deptEmployees = await Employee.find({
      department: req.user.employee?.department,
    }).select("_id");
    filter.employee = { $in: deptEmployees.map((e) => e._id) };
  }

  if (status) filter.status = status;
  if (year) filter.year = parseInt(year);
  if (type) filter.type = type;

  const appraisals = await Appraisal.find(filter)
    .populate("employee", "firstName lastName employeeCode department photo")
    .populate("appraiser", "firstName lastName employeeCode")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: appraisals.length,
    appraisals,
  });
});

// @desc    Get single appraisal (full detail)
// @route   GET /api/appraisals/:id
// @access  Private
exports.getAppraisal = asyncHandler(async (req, res, next) => {
  const appraisal = await Appraisal.findById(req.params.id)
    .populate({
      path: "employee",
      select: "firstName lastName employeeCode photo department position",
      populate: [
        { path: "department", select: "name" },
        { path: "position", select: "title" },
      ],
    })
    .populate("appraiser", "firstName lastName employeeCode");

  if (!appraisal) {
    return next(new ErrorHandler("Appraisal not found.", 404));
  }

  // Employees can only view their own appraisal
  if (
    req.user.role === "employee" &&
    appraisal.employee._id.toString() !== req.user.employee?._id.toString()
  ) {
    return next(
      new ErrorHandler("Not authorized to view this appraisal.", 403),
    );
  }

  res.status(200).json({ success: true, appraisal });
});

// @desc    Create new appraisal for an employee
// @route   POST /api/appraisals
// @access  Super Admin, HR Manager
exports.createAppraisal = asyncHandler(async (req, res, next) => {
  const { employeeId, appraiserId, period, year, type, goals } = req.body;

  if (!employeeId || !period || !year) {
    return next(
      new ErrorHandler("Employee ID, period, and year are required.", 400),
    );
  }

  // Verify employee exists
  const employee = await Employee.findById(employeeId);
  if (!employee) {
    return next(new ErrorHandler("Employee not found.", 404));
  }

  // Prevent duplicate appraisal for same employee same period
  const existing = await Appraisal.findOne({
    employee: employeeId,
    period,
    year: parseInt(year),
  });

  if (existing) {
    return next(
      new ErrorHandler(
        `An appraisal for this employee already exists for ${period} ${year}.`,
        400,
      ),
    );
  }

  // Validate goals — weights must add up to 100
  if (goals && goals.length > 0) {
    const totalWeight = goals.reduce((sum, g) => sum + (g.weight || 0), 0);
    if (totalWeight !== 100) {
      return next(
        new ErrorHandler(
          `Goal weights must add up to 100%. Current total: ${totalWeight}%`,
          400,
        ),
      );
    }
  }

  const appraisal = await Appraisal.create({
    employee: employeeId,
    appraiser: appraiserId || null,
    period,
    year: parseInt(year),
    type: type || "Annual",
    goals: goals || [],
    status: "Not Started",
  });

  await appraisal.populate("employee", "firstName lastName employeeCode");

  res.status(201).json({
    success: true,
    message: `Appraisal created for ${employee.firstName} ${employee.lastName}.`,
    appraisal,
  });
});

// @desc    Create appraisals for ALL active employees at once
// @route   POST /api/appraisals/bulk-create
// @access  Super Admin, HR Manager
exports.bulkCreateAppraisals = asyncHandler(async (req, res, next) => {
  const { period, year, type, defaultGoals } = req.body;

  if (!period || !year) {
    return next(new ErrorHandler("Period and year are required.", 400));
  }

  // Validate default goals weights
  if (defaultGoals && defaultGoals.length > 0) {
    const totalWeight = defaultGoals.reduce(
      (sum, g) => sum + (g.weight || 0),
      0,
    );
    if (totalWeight !== 100) {
      return next(
        new ErrorHandler(
          `Goal weights must add up to 100%. Current total: ${totalWeight}%`,
          400,
        ),
      );
    }
  }

  // Get all active employees
  const employees = await Employee.find({ status: "Active" });

  const results = { created: 0, skipped: 0 };

  for (const emp of employees) {
    // Skip if appraisal already exists
    const existing = await Appraisal.findOne({
      employee: emp._id,
      period,
      year: parseInt(year),
    });

    if (existing) {
      results.skipped++;
      continue;
    }

    await Appraisal.create({
      employee: emp._id,
      period,
      year: parseInt(year),
      type: type || "Annual",
      goals: defaultGoals || [],
      status: "Not Started",
    });

    results.created++;
  }

  res.status(201).json({
    success: true,
    message: `Bulk appraisal creation complete.`,
    results,
  });
});

// @desc    Update goals for an appraisal
// @route   PUT /api/appraisals/:id/goals
// @access  Super Admin, HR Manager, HOD
exports.updateGoals = asyncHandler(async (req, res, next) => {
  const { goals } = req.body;

  if (!goals || goals.length === 0) {
    return next(new ErrorHandler("At least one goal is required.", 400));
  }

  // Validate weights add up to 100
  const totalWeight = goals.reduce((sum, g) => sum + (g.weight || 0), 0);
  if (totalWeight !== 100) {
    return next(
      new ErrorHandler(
        `Goal weights must add up to 100%. Current total: ${totalWeight}%`,
        400,
      ),
    );
  }

  const appraisal = await Appraisal.findById(req.params.id);
  if (!appraisal) {
    return next(new ErrorHandler("Appraisal not found.", 404));
  }

  // Cannot update goals after appraisal is completed
  if (appraisal.status === "Completed") {
    return next(
      new ErrorHandler("Cannot update goals of a completed appraisal.", 400),
    );
  }

  appraisal.goals = goals;
  appraisal.status = "Self Appraisal"; // ready for employee to fill
  await appraisal.save();

  res.status(200).json({
    success: true,
    message: "Goals updated. Employee can now submit self appraisal.",
    appraisal,
  });
});

// @desc    Employee submits self appraisal
// @route   PUT /api/appraisals/:id/self-appraisal
// @access  Employee (own appraisal only)
exports.submitSelfAppraisal = asyncHandler(async (req, res, next) => {
  const { selfAppraisal, selfScores } = req.body;
  // selfScores = [{ goalIndex: 0, score: 85 }, ...]

  if (!selfAppraisal) {
    return next(new ErrorHandler("Self appraisal text is required.", 400));
  }

  const appraisal = await Appraisal.findById(req.params.id);
  if (!appraisal) {
    return next(new ErrorHandler("Appraisal not found.", 404));
  }

  // Only the employee themselves can submit self appraisal
  if (appraisal.employee.toString() !== req.user.employee?._id.toString()) {
    return next(
      new ErrorHandler("You can only submit your own self appraisal.", 403),
    );
  }

  if (appraisal.status !== "Self Appraisal") {
    return next(
      new ErrorHandler(
        "This appraisal is not in the self appraisal stage.",
        400,
      ),
    );
  }

  // Update self scores for each goal
  if (selfScores && selfScores.length > 0) {
    selfScores.forEach(({ goalIndex, score }) => {
      if (appraisal.goals[goalIndex] !== undefined) {
        appraisal.goals[goalIndex].selfScore = score;
      }
    });
  }

  // Calculate self total score
  const selfTotal = appraisal.goals.reduce((sum, g) => {
    return sum + ((g.selfScore || 0) * (g.weight || 0)) / 100;
  }, 0);

  appraisal.selfAppraisal = selfAppraisal;
  appraisal.selfTotalScore = parseFloat(selfTotal.toFixed(2));
  appraisal.status = "Manager Review"; // move to next stage
  await appraisal.save();

  res.status(200).json({
    success: true,
    message: "Self appraisal submitted. Awaiting manager review.",
    appraisal,
  });
});

// @desc    Manager/HOD reviews and scores the appraisal
// @route   PUT /api/appraisals/:id/manager-review
// @access  HOD, HR Manager, Super Admin
exports.managerReview = asyncHandler(async (req, res, next) => {
  const { managerFeedback, managerScores, appraiserId } = req.body;
  // managerScores = [{ goalIndex: 0, score: 90 }, ...]

  if (!managerFeedback) {
    return next(new ErrorHandler("Manager feedback is required.", 400));
  }

  const appraisal = await Appraisal.findById(req.params.id);
  if (!appraisal) {
    return next(new ErrorHandler("Appraisal not found.", 404));
  }

  if (appraisal.status !== "Manager Review") {
    return next(
      new ErrorHandler(
        "This appraisal is not in the manager review stage.",
        400,
      ),
    );
  }

  // Update manager scores for each goal
  if (managerScores && managerScores.length > 0) {
    managerScores.forEach(({ goalIndex, score }) => {
      if (appraisal.goals[goalIndex] !== undefined) {
        appraisal.goals[goalIndex].managerScore = score;
      }
    });
  }

  // Calculate manager total score (weighted)
  const managerTotal = appraisal.goals.reduce((sum, g) => {
    return sum + ((g.managerScore || 0) * (g.weight || 0)) / 100;
  }, 0);

  // Calculate final score using weighted goals
  const finalScore = calculateFinalScore(appraisal.goals);

  appraisal.appraiser = appraiserId || req.user.employee?._id;
  appraisal.managerFeedback = managerFeedback;
  appraisal.managerTotalScore = parseFloat(managerTotal.toFixed(2));
  appraisal.finalScore = finalScore;
  appraisal.rating = scoreToRating(finalScore);
  appraisal.status = "HR Review"; // move to HR for final check
  await appraisal.save();

  res.status(200).json({
    success: true,
    message: `Manager review submitted. Final score: ${finalScore}. Rating: ${appraisal.rating}`,
    appraisal,
  });
});

// @desc    HR finalizes and completes the appraisal
// @route   PUT /api/appraisals/:id/complete
// @access  Super Admin, HR Manager
exports.completeAppraisal = asyncHandler(async (req, res, next) => {
  const { remarks, overrideFinalScore } = req.body;

  const appraisal = await Appraisal.findById(req.params.id);
  if (!appraisal) {
    return next(new ErrorHandler("Appraisal not found.", 404));
  }

  if (appraisal.status !== "HR Review") {
    return next(
      new ErrorHandler(
        "Appraisal must be in HR Review stage before completing.",
        400,
      ),
    );
  }

  // HR can override the final score if needed
  if (overrideFinalScore !== undefined && overrideFinalScore !== null) {
    if (overrideFinalScore < 0 || overrideFinalScore > 100) {
      return next(new ErrorHandler("Score must be between 0 and 100.", 400));
    }
    appraisal.finalScore = overrideFinalScore;
    appraisal.rating = scoreToRating(overrideFinalScore);
  }

  appraisal.status = "Completed";
  appraisal.completedAt = new Date();
  await appraisal.save();

  // Populate employee for response
  await appraisal.populate("employee", "firstName lastName employeeCode");

  res.status(200).json({
    success: true,
    message: `Appraisal completed for ${appraisal.employee.firstName}. Final rating: ${appraisal.rating}`,
    appraisal,
  });
});

// @desc    Delete appraisal (only drafts)
// @route   DELETE /api/appraisals/:id
// @access  Super Admin
exports.deleteAppraisal = asyncHandler(async (req, res, next) => {
  const appraisal = await Appraisal.findById(req.params.id);
  if (!appraisal) {
    return next(new ErrorHandler("Appraisal not found.", 404));
  }

  // Only allow deletion of appraisals that haven't started
  if (appraisal.status !== "Not Started") {
    return next(
      new ErrorHandler(
        "Only appraisals that have not started can be deleted.",
        400,
      ),
    );
  }

  await appraisal.deleteOne();

  res.status(200).json({
    success: true,
    message: "Appraisal deleted.",
  });
});

// @desc    Get appraisal statistics for dashboard
// @route   GET /api/appraisals/stats
// @access  Super Admin, HR Manager
exports.getAppraisalStats = asyncHandler(async (req, res) => {
  const { year } = req.query;
  const currentYear = parseInt(year) || new Date().getFullYear();

  const [total, notStarted, inProgress, completed, ratingBreakdown] =
    await Promise.all([
      // Total appraisals this year
      Appraisal.countDocuments({ year: currentYear }),

      // Not started
      Appraisal.countDocuments({ year: currentYear, status: "Not Started" }),

      // In progress (any stage before completed)
      Appraisal.countDocuments({
        year: currentYear,
        status: { $in: ["Self Appraisal", "Manager Review", "HR Review"] },
      }),

      // Completed
      Appraisal.countDocuments({ year: currentYear, status: "Completed" }),

      // Rating breakdown
      Appraisal.aggregate([
        { $match: { year: currentYear, status: "Completed" } },
        { $group: { _id: "$rating", count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
    ]);

  // Average score of completed appraisals
  const avgResult = await Appraisal.aggregate([
    { $match: { year: currentYear, status: "Completed" } },
    { $group: { _id: null, avgScore: { $avg: "$finalScore" } } },
  ]);

  const averageScore =
    avgResult.length > 0 ? parseFloat(avgResult[0].avgScore.toFixed(2)) : 0;

  res.status(200).json({
    success: true,
    year: currentYear,
    stats: {
      total,
      notStarted,
      inProgress,
      completed,
      averageScore,
      ratingBreakdown,
    },
  });
});
