// routes/departmentRoutes.js
// Department endpoints — all protected, some admin only

const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");
const {
  getDepartments,
  getDepartment,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} = require("../controllers/departmentController");

// All routes require login
router.use(protect);

router
  .route("/")
  .get(getDepartments) // all roles can view
  .post(authorize("super_admin", "hr_manager"), createDepartment);

router
  .route("/:id")
  .get(getDepartment)
  .put(authorize("super_admin", "hr_manager"), updateDepartment)
  .delete(authorize("super_admin"), deleteDepartment);

module.exports = router;
