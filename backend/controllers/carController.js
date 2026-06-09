const Car = require('../models/Car');

// Hämta alla bilar
exports.getAllCars = async (req, res) => {
  try {
    const cars = await Car.find();
    res.status(200).json(cars);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Hämta en specifik bil
exports.getCarById = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) {
      return res.status(404).json({ message: 'Bil inte funnen' });
    }
    res.status(200).json(car);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Skapa ny bil (admin)
exports.createCar = async (req, res) => {
  try {
    const car = new Car(req.body);
    await car.save();
    res.status(201).json({ message: 'Bil skapad', car });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Uppdatera bil (admin)
exports.updateCar = async (req, res) => {
  try {
    const car = await Car.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!car) {
      return res.status(404).json({ message: 'Bil inte funnen' });
    }
    res.status(200).json({ message: 'Bil uppdaterad', car });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Ta bort bil (admin)
exports.deleteCar = async (req, res) => {
  try {
    const car = await Car.findByIdAndDelete(req.params.id);
    if (!car) {
      return res.status(404).json({ message: 'Bil inte funnen' });
    }
    res.status(200).json({ message: 'Bil borttagen' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};