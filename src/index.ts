import { server } from './server'

const PORT = 5050

console.log('🔥 Express server initialized, awaiting WebSocket setup...')

server.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`)
})
