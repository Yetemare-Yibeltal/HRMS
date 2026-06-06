// controllers/notificationController.js
// Handles system notifications for all modules

const Notification = require("../models/Notification");
const asyncHandler = require("../utils/asyncHandler");
const ErrorHandler = require("../utils/errorHandler");

// @desc    Get all notifications for logged-in user
// @route   GET /api/notifications
// @access  Private
exports.getMyNotifications = asyncHandler(async (req, res) => {
  const { unreadOnly } = req.query;

  const filter = { recipient: req.user._id };
  if (unreadOnly === "true") filter.isRead = false;

  const notifications = await Notification.find(filter)
    .sort({ createdAt: -1 })
    .limit(50); // max 50 latest notifications

  const unreadCount = await Notification.countDocuments({
    recipient: req.user._id,
    isRead: false,
  });

  res.status(200).json({
    success: true,
    unreadCount,
    count: notifications.length,
    notifications,
  });
});

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
exports.markAsRead = asyncHandler(async (req, res, next) => {
  const notification = await Notification.findById(req.params.id);

  if (!notification) {
    return next(new ErrorHandler("Notification not found.", 404));
  }

  // Ensure user only marks their own notifications
  if (notification.recipient.toString() !== req.user._id.toString()) {
    return next(new ErrorHandler("Not authorized.", 403));
  }

  notification.isRead = true;
  notification.readAt = new Date();
  await notification.save();

  res.status(200).json({ success: true, message: "Marked as read." });
});

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/mark-all-read
// @access  Private
exports.markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { recipient: req.user._id, isRead: false },
    { isRead: true, readAt: new Date() },
  );

  res.status(200).json({
    success: true,
    message: "All notifications marked as read.",
  });
});

// @desc    Delete a notification
// @route   DELETE /api/notifications/:id
// @access  Private
exports.deleteNotification = asyncHandler(async (req, res, next) => {
  const notification = await Notification.findById(req.params.id);

  if (!notification) {
    return next(new ErrorHandler("Notification not found.", 404));
  }

  if (notification.recipient.toString() !== req.user._id.toString()) {
    return next(new ErrorHandler("Not authorized.", 403));
  }

  await notification.deleteOne();

  res.status(200).json({ success: true, message: "Notification deleted." });
});

// @desc    Send notification to a user (internal helper + API)
// @route   POST /api/notifications/send
// @access  Super Admin, HR Manager
exports.sendNotification = asyncHandler(async (req, res, next) => {
  const { recipientId, title, message, type, link } = req.body;

  if (!recipientId || !title || !message) {
    return next(
      new ErrorHandler("Recipient, title, and message are required.", 400),
    );
  }

  const notification = await Notification.create({
    recipient: recipientId,
    title,
    message,
    type: type || "General",
    link: link || "",
  });

  res.status(201).json({
    success: true,
    message: "Notification sent.",
    notification,
  });
});

// Reusable helper function to create notifications from other controllers
// Usage: await createNotification(userId, 'Leave Approved', 'Your leave has been approved', 'Leave')
const createNotification = async (
  recipientId,
  title,
  message,
  type = "General",
  link = "",
) => {
  try {
    await Notification.create({
      recipient: recipientId,
      title,
      message,
      type,
      link,
    });
  } catch (error) {
    // Notification failure should not break the main operation
    console.error("Notification error:", error.message);
  }
};

module.exports.createNotification = createNotification;
