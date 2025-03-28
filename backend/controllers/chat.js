const asyncHandler = require('express-async-handler')
const chatService = require('../services/chat')

const getChats = asyncHandler(async (req, res) => {
    try {
        const result = await chatService.getChats(req.user._id)
        res.status(200).json({ 
            success: true, 
            data: result 
        })
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        })
    }
})

const getChatWith = asyncHandler(async (req, res) => {
    try {
        const { uid } = req.params
        const chat = await chatService.getChatWith(req.user._id, uid)
        
        res.status(200).json({ 
            success: true, 
            data: chat
        })
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        })
    }
})

const sendMessage = asyncHandler(async (req, res) => {
    try {
        const { receiverId, content } = req.body
        const chat = await chatService.sendMessage(req.user._id, receiverId, content)
        
        res.status(200).json({ 
            success: true, 
            data: chat 
        })
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        })
    }
})

const markMessagesAsRead = asyncHandler(async (req, res) => {
    try {
        const { chatId } = req.params
        await chatService.markMessagesAsRead(chatId, req.user._id)
        
        res.status(200).json({ 
            success: true, 
            message: 'Messages marked as read' 
        })
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        })
    }
})

module.exports = {
    getChats,
    getChatWith,
    sendMessage,
    markMessagesAsRead
}