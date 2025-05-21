import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../data/uploads"));
  },
  filename: function (req, file, cb) {
    cb(
      null,
      "stt-" + Date.now() + path.extname(file.originalname)
    );
  },
});

// Filter for audio files
const fileFilter = (req, file, cb) => {
  // Accept audio files
  if (
    file.mimetype.startsWith("audio/") ||
    file.mimetype === "video/mp4" ||
    file.mimetype === "video/webm"
  ) {
    cb(null, true);
  } else {
    cb(new Error("Only audio and video files are allowed!"), false);
  }
};

// Create the multer upload instance
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 100, // 100MB max file size
  },
  fileFilter: fileFilter,
});

// Export the configured upload middleware
export { upload };
