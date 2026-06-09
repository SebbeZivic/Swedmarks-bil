const express = require("express");
const {
  getAllCars,
  getCarById,
  createCar,
  updateCar,
  deleteCar,
} = require("../controllers/carController");
const { authenticate } = require("../middleware/authMiddleware");

const router = express.Router();

// Publika routes (vem som helst kan se)
router.get("/", getAllCars);
router.get("/:id", getCarById);

// Admin routes (bara inloggade)
router.post("/", authenticate, createCar);
router.put("/:id", authenticate, updateCar);
router.delete("/:id", authenticate, deleteCar);

module.exports = router;
