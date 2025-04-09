import { io } from 'socket.io-client'

const socket = io(process.env.REACT_APP_API_URI.replace('/api', ''), {
    path: '/socket.io',
    transports: ['websocket', 'polling'],
    withCredentials: true,
})

export default socket
