const { Server } = require('socket.io');
const Chat = require('../models/chat');

const initSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL,
      methods: ["GET", "POST", "PUT", "DELETE"],
      credentials: true,
    },
    path: '/socket.io', // khớp với client nếu dùng
  });

  io.on('connection', (socket) => {
    // Join phòng cá nhân dựa theo userId
    socket.on('join', (userId) => {
      socket.join(userId);
    });

    // Nhận tin nhắn từ 1-1 và lưu vào DB
    socket.on('send-message', async (data) => {
      try {
        if (!data.sender || !data.receiverId || !data.content) {
          throw new Error('Thiếu dữ liệu tin nhắn');
        }

        // Tìm hoặc tạo cuộc trò chuyện
        const chat = await Chat.findOneAndUpdate(
          {
            participants: { $all: [data.sender, data.receiverId] },
          },
          {
            $push: {
              messages: {
                sender: data.sender,
                content: data.content,
                timestamp: new Date(),
              },
            },
            $set: { lastMessage: data.content },
          },
          { upsert: true, new: true }
        );

        // Gửi lại tin nhắn cho cả 2 user
        io.to(data.sender).to(data.receiverId).emit('new-message', {
          chatId: chat._id,
          sender: data.sender,
          receiverId: data.receiverId,
          content: data.content,
          timestamp: new Date(),
        });
      } catch (error) {
        console.error('❌ Lỗi khi gửi tin nhắn:', error.message);
        socket.emit('message-error', {
          message: 'Gửi tin nhắn thất bại',
          error: error.message,
        });
      }
    });

    // Xử lý trạng thái đang gõ
    socket.on('typing', (data) => {
      socket.to(data.receiverId).emit('user-typing', {
        sender: data.sender,
      });
    });

    socket.on('stop-typing', (data) => {
      socket.to(data.receiverId).emit('user-stop-typing', {
        sender: data.sender,
      });
    });

    socket.on('disconnect', () => {
    });
  });
};

module.exports = initSocket;
