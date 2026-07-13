const express = require("express");
const {
  getAllCars,
  getCarById,
  createCar,
  updateCar,
  deleteCar,
} = require("../controllers/carController");
const { isAdmin } = require("../middleware/authMiddleware");
const { validateCar } = require("../middleware/validationMiddleware");

const router = express.Router();

// Publika routes
router.get("/", getAllCars);
router.get("/:id", getCarById);

// Admin-only routes med validering
router.post("/", isAdmin, validateCar, createCar);
router.put("/:id", isAdmin, validateCar, updateCar);
router.delete("/:id", isAdmin, deleteCar);

module.exports = router;
