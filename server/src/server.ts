import express from "express"
import { WebSocket, WebSocketServer } from "ws"
import cors from "cors"


const app = express()
const PORT = 8000
const PORT_WSS = 8001


app.use(cors())
app.use(express.json())


const wss = new WebSocketServer({ port: PORT_WSS })


type JoinMessage = {
    type: "join"
    username: string
}

type ChatMessage = {
    type: "message"
    sender: string
    content: string
    timestamp: number
}


const clients = new Map<WebSocket, string>()


wss.on("connection", (ws: WebSocket) => {

    ws.on("message", (data: string) => {
        const message = JSON.parse(data) as JoinMessage | ChatMessage

        if (message.type == "join") {
            clients.set(ws, message.username)

            broadcastMessage({
                type: "message",
                sender: "system",
                content: `${message.username} has joined the chat`,
                timestamp: Date.now()
            })
        }

        else if (message.type == "message") {
            broadcastMessage({
                type: "message",
                sender: clients.get(ws) ?? "Anonymous",
                content: message.content,
                timestamp: Date.now()
            })
        }
    })

    ws.on("close", () => {
        const username = clients.get(ws)
        clients.delete(ws)

        broadcastMessage({
            type: "message",
            sender: "system",
            content: `${username} has left the chat`,
            timestamp: Date.now()
        })
    })

})


const broadcastMessage = (message: ChatMessage) => {
    const messageStr: string = JSON.stringify(message)

    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(messageStr)
        }
    })
}


app.listen(PORT, () => {
    console.log(`Server running at: http://localhost:${PORT}`)
})