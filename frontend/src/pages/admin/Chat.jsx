import React, { useEffect, useState, useRef, useCallback } from 'react'
import { useSelector } from 'react-redux'
import { io } from 'socket.io-client'
import { 
    apiGetUsers, 
    apiGetChatWith, 
    apiSendMessage,
    apiGetChats 
} from 'apis'
import useDebounce from 'hooks/useDebounce'

const socket = io(process.env.REACT_APP_API_URI.replace('/api', ''), {
    path: '/socket.io',
    withCredentials: true,
    transports: ['websocket', 'polling']
})

const Chat = () => {
    const { current } = useSelector(state => state.user)
    const [users, setUsers] = useState([])
    const [chats, setChats] = useState([])
    const [filteredUsers, setFilteredUsers] = useState([])
    const [selectedUser, setSelectedUser] = useState(null)
    const [messages, setMessages] = useState([])
    const [newMessage, setNewMessage] = useState('')
    const [queries, setQueries] = useState({
        q: ""
    })
    const searchInputRef = useRef(null)
    const messagesEndRef = useRef(null)
    const [isTyping, setIsTyping] = useState(false)
    const [localIsTyping, setLocalIsTyping] = useState(false)
    const lastTypingTimeRef = useRef(null)
    const lastMessageRef = useRef(null)

    // Use debounce for search query
    const queriesDebounce = useDebounce(queries.q, 800)

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages])

    // Socket event listeners
    useEffect(() => {
        // Establish connection
        socket.on('connect', () => {
            console.log('Socket connected')
            // Join personal room
            socket.emit('join', current._id)
        })

        // Listen for new messages
        socket.on('new-message', (msg) => {
            // Prevent duplicate messages
            if (
                (msg.sender === selectedUser?._id && msg.receiverId === current._id) ||
                (msg.sender === current._id && msg.receiverId === selectedUser?._id)
            ) {
                // Check if this message is already in the messages array
                const isDuplicate = messages.some(
                    existingMsg => 
                        existingMsg.content === msg.content && 
                        existingMsg.sender === msg.sender && 
                        new Date(existingMsg.timestamp).getTime() === new Date(msg.timestamp).getTime()
                )

                if (!isDuplicate) {
                    setMessages(prevMessages => [...prevMessages, msg])
                }
            }
        })

        // Listen for typing indicators
        socket.on('user-typing', (data) => {
            if (data.sender === selectedUser?._id) {
                setIsTyping(true)
            }
        })

        socket.on('user-stop-typing', (data) => {
            if (data.sender === selectedUser?._id) {
                setIsTyping(false)
            }
        })

        // Handle connection errors
        socket.on('connect_error', (error) => {
            console.error('Socket connection error:', error)
        })

        return () => {
            socket.off('connect')
            socket.off('new-message')
            socket.off('user-typing')
            socket.off('user-stop-typing')
            socket.off('connect_error')
        }
    }, [current._id, selectedUser, messages])

    // Fetch chat history when a user is selected
    useEffect(() => {
        const fetchChatHistory = async () => {
            if (selectedUser) {
                try {
                    const res = await apiGetChatWith(selectedUser._id)
                    if (res?.data?.messages) {
                        setMessages(res.data.messages)
                    }
                } catch (error) {
                    console.error('Error fetching chat history:', error)
                }
            }
        }

        fetchChatHistory()
    }, [selectedUser])

    // Fetch all chats
    const fetchChats = useCallback(async () => {
        try {
            const res = await apiGetChats()
            if (res?.success) {
                setChats(res.data)
            }
        } catch (error) {
            console.error('Error fetching chats:', error)
        }
    }, [])

    // Fetch users with search functionality
    const fetchUsers = useCallback(async (params = {}) => {
        try {
            const res = await apiGetUsers({ 
                ...params, 
                limit: process.env.REACT_APP_LIMIT 
            })
            
            if (res?.success) {
                const filteredUsers = res.users.filter(u => u._id !== current._id)
                setUsers(filteredUsers)
                setFilteredUsers(filteredUsers)
            }
        } catch (error) {
            console.error('Error fetching users:', error)
        }
    }, [current._id])

    // Initial fetches
    useEffect(() => {
        fetchChats()
        const params = queriesDebounce ? { q: queriesDebounce } : {}
        fetchUsers(params)
    }, [queriesDebounce, fetchUsers, fetchChats])

    // Handle search input
    const handleSearchUsers = (e) => {
        const searchTerm = e.target.value
        setQueries(prev => ({ ...prev, q: searchTerm }))
    }

    // Select user from list
    const handleSelectUser = (user) => {
        setSelectedUser(user)
        setQueries({ q: '' })
        // Reset typing states when changing user
        setIsTyping(false)
        setLocalIsTyping(false)
    }

    // Send message
    const handleSend = async () => {
        if (newMessage.trim() && selectedUser) {
            try {
                const messageData = {
                    receiverId: selectedUser._id,
                    content: newMessage.trim()
                }
                
                // Use socket to send message
                const messageToSend = {
                    ...messageData,
                    sender: current._id,
                    timestamp: new Date()
                }

                // Emit message via socket
                socket.emit('send-message', messageToSend)
                
                // Clear input
                setNewMessage('')
                // Reset typing states
                setLocalIsTyping(false)
            } catch (error) {
                console.error('Error sending message:', error)
            }
        }
    }

    // Typing indicators
    const handleTyping = () => {
        const currentTime = new Date().getTime()
        
        if (!localIsTyping && selectedUser) {
            socket.emit('typing', {
                sender: current._id,
                receiverId: selectedUser._id
            })
            setLocalIsTyping(true)
        }
        
        lastTypingTimeRef.current = currentTime
        
        setTimeout(() => {
            const typingTimer = new Date().getTime()
            const timeDiff = typingTimer - lastTypingTimeRef.current
            
            if (timeDiff >= 3000 && localIsTyping) {
                socket.emit('stop-typing', {
                    sender: current._id,
                    receiverId: selectedUser._id
                })
                setLocalIsTyping(false)
            }
        }, 3000)
    }

    // Handle send on Enter key
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSend()
        }
        handleTyping()
    }

    return (
        <div className="p-4 flex gap-4 h-[calc(100vh-100px)] bg-gray-50">
            {/* Users List */}
            <div className="w-1/4 bg-white border rounded-lg shadow-md relative">
                <div className="p-3 border-b">
                    <input 
                        ref={searchInputRef}
                        type="text" 
                        placeholder="Tìm kiếm người dùng..." 
                        className="w-full px-3 py-2 border rounded"
                        value={queries.q}
                        onChange={handleSearchUsers}
                    />
                </div>
                <div className="overflow-y-auto max-h-[calc(100vh-200px)]">
                    {filteredUsers.map(u => (
                        <div
                            key={u._id}
                            onClick={() => handleSelectUser(u)}
                            className={`
                                cursor-pointer p-3 hover:bg-gray-100 
                                flex items-center 
                                ${selectedUser?._id === u._id ? 'bg-blue-100' : ''}
                            `}
                        >
                            <img 
                                src={u.avatar || '/default-avatar.png'} 
                                alt={u.firstname} 
                                className="w-10 h-10 rounded-full mr-3"
                            />
                            <div>
                                <div className="font-semibold">
                                    {u.firstname} {u.lastname}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Chat Area */}
            <div className="w-3/4 flex flex-col bg-white border rounded-lg shadow-md">
                {/* Chat Header */}
                <div className="p-4 border-b flex items-center">
                    {selectedUser ? (
                        <>
                            <img 
                                src={selectedUser.avatar || '/default-avatar.png'} 
                                alt={selectedUser.firstname} 
                                className="w-12 h-12 rounded-full mr-3"
                            />
                            <div>
                                <div className="font-bold text-lg">
                                    {selectedUser.firstname} {selectedUser.lastname}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="text-gray-500">Chọn người để bắt đầu chat</div>
                    )}
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {selectedUser ? (
                        messages.map((msg, index) => (
                            <div 
                                key={index} 
                                className={`flex ${
                                    msg.sender === current._id 
                                        ? 'justify-end' 
                                        : 'justify-start'
                                }`}
                            >
                                <div 
                                    className={`
                                        max-w-xs p-2 rounded-lg 
                                        ${msg.sender === current._id 
                                            ? 'bg-blue-500 text-white' 
                                            : 'bg-gray-200'}
                                    `}
                                >
                                    {msg.content}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center text-gray-500 mt-10">
                            Chọn một người dùng để bắt đầu trò chuyện
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
                {isTyping && (
                    <div className="text-gray-500 italic p-2">
                        {selectedUser.firstname} is typing...
                    </div>
                )}

                {/* Message Input */}
                {selectedUser && (
                    <div className="p-4 border-t flex">
                        <input
                            type="text"
                            className="flex-1 border rounded-l px-3 py-2"
                            value={newMessage}
                            onChange={e => {
                                setNewMessage(e.target.value)
                                handleTyping()
                            }}
                            onKeyDown={handleKeyDown}
                            placeholder="Nhập tin nhắn..."
                        />
                        <button 
                            onClick={handleSend} 
                            className="bg-blue-500 text-white px-4 py-2 rounded-r"
                            disabled={!newMessage.trim()}
                        >
                            Gửi
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Chat