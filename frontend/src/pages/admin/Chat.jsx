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

    console.log("Current user role: ", current.role)

    // Use debounce for search query
    const queriesDebounce = useDebounce(queries.q, 800)

    const fetchUsers = useCallback(async (params = {}) => {
        try {
            const res = await apiGetUsers({ 
                ...params, 
                limit: process.env.REACT_APP_LIMIT,
                role: [1945, 1980]
            })
            
            if (res?.success) {
                // Log full user details for debugging
                console.log("All fetched users:", res.users.map(u => ({
                    id: u._id,
                    firstname: u.firstname,
                    lastname: u.lastname,
                    role: u.role,
                    fullUser: u
                    }))
                )
                const filteredUsers = res.users.filter(u => 
                    u._id !== current._id 
                )
                                
                setUsers(filteredUsers)
                setFilteredUsers(filteredUsers)
            }
        } catch (error) {
            console.error('Error fetching users:', error)
        }
    }, [current._id])

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
        <div className="p-2 bg-gradient-to-br from-purple-50 to-pink-50">
            <div className="max-w-7xl mx-auto bg-white/30 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden">
                <div className="flex h-[calc(100vh-100px)]">
                    {/* Users List */}
                    <div className="w-1/4 bg-white/60 border-r border-white/20 relative">
                        <div className="p-4 border-b border-white/20">
                            <input 
                                ref={searchInputRef}
                                type="text" 
                                placeholder="Tìm kiếm người dùng..." 
                                className="w-full px-4 py-3 border border-purple-200 rounded-xl 
                                focus:ring-2 focus:ring-purple-300 transition-all duration-300
                                bg-purple-50/50 text-sm"
                                value={queries.q}
                                onChange={handleSearchUsers}
                            />
                        </div>
                        <div className="overflow-y-auto max-h-[calc(100vh-200px)] scrollbar-thin scrollbar-thumb-purple-300">
                            {filteredUsers.map(u => (
                                <div
                                    key={u._id}
                                    onClick={() => handleSelectUser(u)}
                                    className={`
                                        cursor-pointer p-4 hover:bg-purple-100/50 
                                        flex items-center transition-all duration-300
                                        ${selectedUser?._id === u._id 
                                            ? 'bg-gradient-to-r from-purple-100 to-pink-100' 
                                            : ''}
                                    `}
                                >
                                    <img 
                                        src={u.avatar || '/default-avatar.png'} 
                                        alt={u.firstname} 
                                        className="w-12 h-12 rounded-full mr-4 
                                        border-2 border-transparent 
                                        bg-gradient-to-r from-purple-300 to-pink-300 p-0.5
                                        transition-transform hover:scale-105"
                                    />
                                    <div>
                                        <div className="font-semibold text-gray-800">
                                            {u.firstname} {u.lastname}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Chat Area */}
                    <div className="w-3/4 flex flex-col">
                        {/* Chat Header */}
                        <div className="p-4 border-b border-white/20 flex items-center 
                            bg-gradient-to-r from-purple-100/50 to-pink-100/50">
                            {selectedUser ? (
                                <div className="flex items-center">
                                    <img 
                                        src={selectedUser.avatar || '/default-avatar.png'} 
                                        alt={selectedUser.firstname} 
                                        className="w-14 h-14 rounded-full mr-4 
                                        border-2 border-transparent 
                                        bg-gradient-to-r from-purple-400 to-pink-400 p-0.5
                                        transition-transform hover:scale-105"
                                    />
                                    <div>
                                        <div className="font-bold text-xl text-transparent 
                                            bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                                            {selectedUser.firstname} {selectedUser.lastname}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-gray-500">Chọn người để bắt đầu chat</div>
                            )}
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4 
                            bg-white/10 scrollbar-thin scrollbar-thumb-purple-200">
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
                                                max-w-xs p-3 rounded-xl shadow-md
                                                ${msg.sender === current._id 
                                                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' 
                                                    : 'bg-white border border-gray-200 text-gray-800'}
                                                transition-all duration-300 hover:scale-[1.02]
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
                            <div className="text-sm text-gray-500 italic p-2 bg-white/20">
                                {selectedUser.firstname} đang soạn tin...
                            </div>
                        )}

                        {/* Message Input */}
                        {selectedUser && (
                            <div className="p-4 border-t border-white/20 bg-white/30">
                                <div className="flex space-x-2">
                                    <input
                                        type="text"
                                        className="flex-1 px-4 py-3 border border-purple-200 
                                        rounded-xl bg-purple-50/50 text-sm
                                        focus:ring-2 focus:ring-purple-300 transition-all duration-300"
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
                                        className="bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 
                                        text-white px-6 py-3 rounded-xl 
                                        hover:opacity-90 transition-all duration-300 
                                        transform hover:scale-[1.02] active:scale-[0.98]
                                        flex items-center justify-center space-x-2"
                                        disabled={!newMessage.trim()}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                        <span>Gửi</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Chat