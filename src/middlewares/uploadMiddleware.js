// src/middlewares/uploadMiddleware.js
import multer from "multer";

// Gunakan memory storage agar mudah dikirim ke Supabase
const storage = multer.memoryStorage();

// Daftar tipe file yang diperbolehkan
const allowedMimeTypes = [
  // Images
  "image/jpeg",
  "image/png",
  "image/webp",

  // Documents
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",       // .xlsx
  "application/vnd.openxmlformats-officedocument.presentationml.presentation" // .pptx
];

// Validasi tipe file
const fileFilter = (req, file, cb) => {
  if (!allowedMimeTypes.includes(file.mimetype)) {
    return cb(
      new Error(
        "File yang diperbolehkan hanya: JPG, PNG, WebP, PDF, DOCX, XLSX, PPTX"
      ),
      false
    );
  }
  cb(null, true);
};

// Konfigurasi multer
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 3 * 1024 * 1024 // max 3MB
  }
});

// Middleware wrapper agar error Multer tidak bikin server crash
export const handleUploadErrors = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // Multer khusus (size, limit, dsb)
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "Ukuran file maksimal adalah 3MB!"
      });
    }

    return res.status(400).json({
      success: false,
      message: err.message
    });
  }

  if (err) {
    // error lain dari fileFilter
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }

  next();
};

export default upload;
