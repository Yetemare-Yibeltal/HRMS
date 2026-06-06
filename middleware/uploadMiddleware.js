// middleware/uploadMiddleware.js
// Handles file uploads using Multer.
// Used for employee profile photos and documents.
// Files are stored in backend/uploads/ folder.

const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ── Storage Engine ────────────────────────────────────────────────────────────
const storage = multer.diskStorage({
  // Set destination folder based on file type
  destination: (req, file, cb) => {
    let folder = "uploads/";

    if (file.fieldname === "photo") {
      folder = "uploads/photos/";
    } else if (file.fieldname === "document") {
      folder = "uploads/documents/";
    } else if (file.fieldname === "resume") {
      folder = "uploads/resumes/";
    }

    // Create folder if it does not exist
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }

    cb(null, folder);
  },

  // Generate unique filename using employee code + timestamp
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueName}${ext}`);
  },
});

// ── File Filter ───────────────────────────────────────────────────────────────
const fileFilter = (req, file, cb) => {
  if (file.fieldname === "photo") {
    // Only allow image files for profile photos
    const allowed = /jpeg|jpg|png|webp/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext && mime) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Only image files (jpeg, jpg, png, webp) are allowed for photos.",
        ),
      );
    }
  } else {
    // Allow common document types for other uploads
    const allowed = /pdf|doc|docx|jpeg|jpg|png/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    if (ext) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Only pdf, doc, docx, and image files are allowed for documents.",
        ),
      );
    }
  }
};

// ── Multer Instance ───────────────────────────────────────────────────────────
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max file size
});

module.exports = upload;
