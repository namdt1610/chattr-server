import express from 'express' // express module is a web framework for Node.js
import http from 'http' // http module is used to create an HTTP server
import { Server } from 'socket.io' // socket.io module is used to create a WebSocket server
import cors from 'cors' // cors module is used to enable Cross-Origin Resource Sharing (CORS) with various options

const app = express() // Create an Express application
const server = http.createServer(app) // Create an HTTP server
const io = new Server(server, {
    cors: {
        origin: '*', // Allow all origins (orgin is the URL of the site that makes the request)
        methods: ['GET', 'POST'],
    },
}) // Create a WebSocket server

// Middleware (is a function that has access to the request and response objects)
app.use(cors()) // Enable CORS
app.use(express.json()) // Parse JSON bodies (as sent by API clients)
// Why convert to JSON? because the data sent by the client is in JSON format.
// The server converts the JSON data into a JavaScript object so that it can be used in the code.

app.get('/', (req, res) => {
    res.send('Server connected!')
}) // Endpoint to test the server

app.post('/api/message', (req, res) => {
    const { room, username, message } = req.body
    console.log(`[${room}] ${username}: ${message}`)
    res.status(200).send('Message received')
})


interface User {
    username: string
    room: string
}

let users: { [key: string]: User } = {}

// Event listener for the connection event
io.on('connection', (socket) => {
    console.log('User connected:', socket.id)

    // socket.on() is used to listen for events
    socket.on('join_room', (room, username) => {
        socket.join(room) // socket.join() is used to join a room
        users[socket.id] = { username, room }
        console.log({ username } + ' joined the room: ' + room)
        io.to(room).emit('receive_message', {
            username: 'System',
            message: `${username} has joined the room.`,
        }) // io.to() is used to send an event to everyone in a room, emit() is used to send an event
    }) // First argument is the event name, second argument is the data to be sent

    socket.on('send_message', (data) => {
        const { room, username, message } = data
        console.log(`[${room}] ${username}: ${message}`)
        io.to(room).emit('receive_message', { username, message })
    })

    socket.on('typing_message', (data) => {
        const { room, username } = data
        console.log(`[${room}] ${username} is typing...`)
        socket.to(room).emit('receive_typing', { username })
    })

    socket.on('disconnect', () => {
        const user = users[socket.id]
        if (user) {
            const { room, username } = user
            io.to(room).emit('receive_message', {
                username: 'System',
                message: `${username} has left the room.`,
            })
            delete users[socket.id]
        }
        console.log('User disconnected:', socket.id)
    })
})

const PORT = 3000
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
}) // listen() is used to bind and listen for connections on the specified host and port
