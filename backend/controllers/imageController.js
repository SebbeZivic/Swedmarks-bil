const Car = require('../models/Car');
const fs = require('fs');
const path = require('path');

// Ladda upp bild till bil
exports.uploadImageToCar = async (req, res) => {
  try {
    const { carId } = req.params;
    
    if (!req.file) {
      return res.status(400).json({ message: 'Ingen bild uppladdad' });
    }

    // Konvertera bild till base64
    const fileData = fs.readFileSync(req.file.path);
    const base64 = fileData.toString('base64');
    const imageUrl = `data:${req.file.mimetype};base64,${base64}`;

    // Hitta bil och lägg till bild
    const car = await Car.findById(carId);
    if (!car) {
      return res.status(404).json({ message: 'Bil inte funnen' });
    }

    // Max 10 bilder per bil
    if (car.images.length >= 10) {
      return res.status(400).json({ message: 'Max 10 bilder per bil' });
    }

    car.images.push(imageUrl);
    await car.save();

    // Ta bort temp-fil
    fs.unlinkSync(req.file.path);

    res.status(200).json({ message: 'Bild uppladdad', car });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Ta bort bild från bil
exports.deleteImageFromCar = async (req, res) => {
  try {
    const { carId, imageIndex } = req.params;

    const car = await Car.findById(carId);
    if (!car) {
      return res.status(404).json({ message: 'Bil inte funnen' });
    }

    car.images.splice(imageIndex, 1);
    await car.save();

    res.status(200).json({ message: 'Bild borttagen', car });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};