const express = require("express");
const {
  getAllCars,
  getCarById,
  createCar,
  updateCar,
  deleteCar,
} = require("../controllers/carController");
const { authenticate } = require("../middleware/authMiddleware");
const { validateCar } = require("../middleware/validationMiddleware");

const router = express.Router();

// Publika routes
router.get("/", getAllCars);
router.get("/:id", getCarById);

// Admin routes med validering
router.post("/", authenticate, validateCar, createCar);
router.put("/:id", authenticate, validateCar, updateCar);
router.delete("/:id", authenticate, deleteCar);

module.exports = router;
