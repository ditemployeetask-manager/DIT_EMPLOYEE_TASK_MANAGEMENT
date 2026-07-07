const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure upload directory exists
const uploadDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Escape special characters and prepend timestamp
    const cleanName = file.originalname.replace(/[^a-zA-Z0-9.]/g, "_");
    cb(null, `${Date.now()}-${cleanName}`);
  },
});

// File filter (restrict to common document & image formats)
const fileFilter = (req, file, cb) => {
  const allowedExtensions = [
    ".pdf", ".doc", ".docx", ".xls", ".xlsx", 
    ".png", ".jpg", ".jpeg", ".txt", ".csv"
  ];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Allowed formats: ${allowedExtensions.join(", ")}`), false);
  }
};

// Multer upload configurations (max 5MB file size, support up to 5 files)
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
}).array("attachments", 5);

module.exports = upload;
