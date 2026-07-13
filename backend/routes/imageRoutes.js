const express = require("express");
const multer = require("multer");
const {
  uploadImageToCar,
  deleteImageFromCar,
} = require("../controllers/imageController");
const { isAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

// Konfigurera multer för bilduppladdning
const upload = multer({
  dest: "uploads/",
  fileFilter: (req, file, cb) => {
    // Tillåt bara bilder
    const allowedMimes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Bara bildfiler tillåtna"));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // Max 5MB
});

// Admin-only routes
router.post("/:carId", isAdmin, upload.single("image"), uploadImageToCar);
router.delete("/:carId/:imageIndex", isAdmin, deleteImageFromCar);

module.exports = router;
