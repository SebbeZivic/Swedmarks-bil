const Message = require("../models/Message");

exports.createMessage = async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ message: "Namn, e-post och meddelande krävs" });
    }
    const msg = new Message({ name, email, phone, message });
    await msg.save();
    res.status(201).json({ message: "Meddelande skickat" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getAllMessages = async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.replyToMessage = async (req, res) => {
  try {
    const { reply } = req.body;
    if (!reply) {
      return res.status(400).json({ message: "Svar krävs" });
    }
    const msg = await Message.findByIdAndUpdate(
      req.params.id,
      { reply, replied: true, replyDate: new Date() },
      { new: true }
    );
    if (!msg) {
      return res.status(404).json({ message: "Meddelande inte funnet" });
    }
    res.status(200).json({ message: "Svar sparat", msg });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
