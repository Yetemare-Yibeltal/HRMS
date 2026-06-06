// routes/employeeRoutes.js
// Employee master data routes with file upload support

const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const {
  getEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  uploadDocument,
  addHistory,
  deleteEmployee,
  getStats,
} = require("../controllers/employeeController");

// All routes require authentication
router.use(protect);

// Stats route — must be before /:id to avoid conflict
router.get("/stats", authorize("super_admin", "hr_manager"), getStats);

// Main CRUD
router
  .route("/")
  .get(authorize("super_admin", "hr_manager", "hod"), getEmployees)
  .post(
    authorize("super_admin", "hr_manager"),
    upload.single("photo"), // handle single photo upload
    createEmployee,
  );

router
  .route("/:id")
  .get(getEmployee) // all roles, with access control inside controller
  .put(
    authorize("super_admin", "hr_manager"),
    upload.single("photo"),
    updateEmployee,
  )
  .delete(authorize("super_admin"), deleteEmployee);

// Document upload
router.post(
  "/:id/documents",
  authorize("super_admin", "hr_manager"),
  upload.single("document"),
  uploadDocument,
);

// Employment history
router.post("/:id/history", authorize("super_admin", "hr_manager"), addHistory);

module.exports = router;
