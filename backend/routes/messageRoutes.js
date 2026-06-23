const express = require("express");
const {
  createMessage,
  getAllMessages,
  replyToMessage,
} = require("../controllers/messageController");
const { isAdmin } = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/", createMessage);
router.get("/", isAdmin, getAllMessages);
router.put("/:id", isAdmin, replyToMessage);

module.exports = router;
