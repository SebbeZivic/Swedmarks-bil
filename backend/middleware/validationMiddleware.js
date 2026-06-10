const { body, validationResult } = require('express-validator');

const carValidationRules = [
  body('title')
    .notEmpty().withMessage('Titel är obligatorisk'),

  body('brand')
    .notEmpty().withMessage('Märke är obligatoriskt'),

  body('model')
    .notEmpty().withMessage('Modell är obligatorisk'),

  body('year')
    .notEmpty().withMessage('År är obligatoriskt')
    .isInt({ min: 1 }).withMessage('År måste vara ett positivt heltal'),

  body('mileage')
    .notEmpty().withMessage('Miltal är obligatoriskt')
    .isInt({ min: 1 }).withMessage('Miltal måste vara ett positivt heltal'),

  body('price')
    .notEmpty().withMessage('Pris är obligatoriskt')
    .isFloat({ min: 0.01 }).withMessage('Pris måste vara ett positivt tal'),

  body('fuel')
    .notEmpty().withMessage('Bränsletyp är obligatorisk')
    .isIn(['Bensin', 'Diesel', 'El', 'Hybrid'])
    .withMessage('Bränsletyp måste vara: Bensin, Diesel, El eller Hybrid'),

  body('transmission')
    .notEmpty().withMessage('Växellåda är obligatorisk')
    .isIn(['Manuell', 'Automatisk'])
    .withMessage('Växellåda måste vara: Manuell eller Automatisk'),

  body('bodyType')
    .notEmpty().withMessage('Karosstyp är obligatorisk'),

  body('color')
    .notEmpty().withMessage('Färg är obligatorisk'),

  body('description')
    .notEmpty().withMessage('Beskrivning är obligatorisk')
    .isLength({ min: 10 }).withMessage('Beskrivning måste vara minst 10 tecken'),
];

const validateCar = [
  ...carValidationRules,
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array().map(e => e.msg) });
    }
    next();
  },
];

module.exports = { validateCar };