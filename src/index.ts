import { server } from './server'
import { initSocket } from './socket/socket'

const PORT: number = Number(process.env.PORT) || 3000

// Khởi động WebSocket
initSocket(server)

server.listen(PORT, () =>
    console.log(`🚀 Server running on http://localhost:${PORT}`)
)
