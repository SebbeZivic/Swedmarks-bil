const User = require("../models/User");
const jwt = require("jsonwebtoken");

// Register
exports.register = async (req, res) => {
  try {
    const { email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "Email redan registrerad" });
    }

    // Kolla om det redan finns en admin
    const adminExists = await User.findOne({ isAdmin: true });
    const isAdmin = !adminExists; // Första användaren blir admin

    const user = new User({ email, password, isAdmin });
    await user.save();

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(201).json({
      message: "Användare registrerad",
      token,
      user: { id: user._id, email: user.email, isAdmin },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Kolla om användaren finns
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Email eller lösenord fel" });
    }

    // Jämför lösenord
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Email eller lösenord fel" });
    }

    // Skapa JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(200).json({
      message: "Inloggning lyckad",
      token,
      user: { id: user._id, email: user.email, isAdmin: user.isAdmin },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
