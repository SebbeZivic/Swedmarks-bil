const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true },
  phone: { type: String, trim: true },
  message: { type: String, required: true, trim: true },
  createdAt: { type: Date, default: Date.now },
  replied: { type: Boolean, default: false },
  reply: { type: String },
  replyDate: { type: Date },
});

module.exports = mongoose.model("Message", messageSchema);
