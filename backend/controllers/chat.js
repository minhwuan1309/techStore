const asyncHandler = require('express-async-handler')
const Chat = require('../models/chat')

const getChats = asyncHandler(async (req, res) => {
    try {
        const userId = req.user._id
        const chats = await Chat.find({ participants: userId })
            .populate('participants', 'firstname lastname avatar')
            .populate({
                path: 'messages.sender',
                select: 'firstname lastname avatar'
            })
            .sort({ updatedAt: -1 })
        
        res.status(200).json({ 
            success: true, 
            data: chats 
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
        const userId = req.user._id
        const { uid: otherUserId } = req.params
        
        let chat = await Chat.findOne({
            participants: {
                $all: [userId, otherUserId]
            }
        })
        .populate('messages.sender', 'firstname lastname avatar')
        .populate('participants', 'firstname lastname avatar')
        
        // If no chat exists, return an empty chat structure
        if (!chat) {
            chat = {
                participants: [userId, otherUserId],
                messages: []
            }
        }
        
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
        const senderId = req.user._id
        const { receiverId, content } = req.body
        
        // Find existing chat
        let chat = await Chat.findOne({
            participants: {
                $all: [senderId, receiverId]
            }
        })

        const message = { 
            sender: senderId, 
            content, 
            timestamp: new Date() 
        }

        if (!chat) {
            // Create new chat if it doesn't exist
            chat = await Chat.create({
                participants: [senderId, receiverId],
                messages: [message],
                lastMessage: content
            })
        } else {
            // Add message to existing chat
            chat.messages.push(message)
            chat.lastMessage = content
            await chat.save()
        }

        // Populate sender details for the new message
        await chat.populate('messages.sender', 'firstname lastname avatar')
        
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
        
        // Mark all messages as read
        await Chat.findByIdAndUpdate(chatId, {
            $set: { 
                'messages.$[].read': true 
            }
        })
        
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