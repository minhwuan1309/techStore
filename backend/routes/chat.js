const router = require("express").Router()
const ctrls = require("../controllers/chat")
const { verifyAccessToken } = require("../middlewares/verifyToken")

router.use(verifyAccessToken)

// Get all chats for the current user
router.get("/", ctrls.getChats)

// Get chat with a specific user
router.get("/:uid", ctrls.getChatWith)

// Send a new message
router.post("/", ctrls.sendMessage)

// Mark messages as read (optional feature)
router.patch("/:chatId/read", ctrls.markMessagesAsRead)

module.exports = router