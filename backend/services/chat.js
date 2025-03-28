const Chat = require('../models/chat')

class ChatService {
    async getChats(userId) {
        return await Chat.find({ participants: userId })
            .populate('participants', 'firstname lastname avatar')
            .populate({
                path: 'messages.sender',
                select: 'firstname lastname avatar'
            })
            .sort({ updatedAt: -1 })
    }

    async getChatWith(userId, otherUserId) {
        let chat = await Chat.findOne({
            participants: {
                $all: [userId, otherUserId]
            }
        })
        .populate('messages.sender', 'firstname lastname avatar')
        .populate('participants', 'firstname lastname avatar')
        
        // If no chat exists, return an empty chat structure
        if (!chat) {
            return {
                participants: [userId, otherUserId],
                messages: []
            }
        }
    
        return chat
    }

    async sendMessage(senderId, receiverId, content) {
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

        return chat
    }

    async markMessagesAsRead(chatId, userId) {
        // Optional: Implement message read status
        await Chat.findByIdAndUpdate(chatId, {
            $set: { 
                'messages.$[].read': true 
            }
        })
    }
}

module.exports = new ChatService()