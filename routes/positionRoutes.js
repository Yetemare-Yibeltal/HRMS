// routes/positionRoutes.js
const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");
const {
  getPositions,
  getPosition,
  createPosition,
  updatePosition,
  deletePosition,
} = require("../controllers/positionController");

router.use(protect);

router
  .route("/")
  .get(getPositions)
  .post(authorize("super_admin", "hr_manager"), createPosition);

router
  .route("/:id")
  .get(getPosition)
  .put(authorize("super_admin", "hr_manager"), updatePosition)
  .delete(authorize("super_admin"), deletePosition);

module.exports = router;
