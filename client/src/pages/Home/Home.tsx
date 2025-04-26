import { FormEvent, useEffect, useRef, useState } from "react"


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


export default function Home() {
    const [joined, setJoined] = useState<boolean>(false)
    const [username, setUsername] = useState<string>("")
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [messageInput, setMessageInput] = useState<string>("")

    const messageEndRef = useRef<HTMLDivElement>(null)
    const ws = useRef<WebSocket | null>(null)


    useEffect(() => {
        if (joined && ws.current === null) {
            ws.current = new WebSocket(import.meta.env.VITE_BACKEND_URL)

            ws.current.onmessage = (e) => {
                const msg = JSON.parse(e.data) as ChatMessage
                setMessages(prev => [...prev, msg])
            }

            ws.current.onopen = () => {
                const joinMsg: JoinMessage = {
                    type: "join",
                    username: username
                }

                ws.current?.send(JSON.stringify(joinMsg))
            }
        }

    }, [joined, username])


    useEffect(() => {
        messageEndRef.current?.scrollIntoView({ behavior: "smooth" })

    }, [messages])


    const handleJoin = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        if (username.trim()) {
            setJoined(true)
        }
    }


    const handleSend = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        if (messageInput.trim() && ws.current) {
            ws.current.send(JSON.stringify({
                type: "message",
                content: messageInput.trim()
            }))

            setMessageInput("")
        }
    }


    if (!joined) {
        return (
            <div className="w-full h-full flex flex-col justify-center items-center">
                <form
                    className="w-[512px] p-16 bg-white shadow-md rounded-xl flex flex-col gap-4 text-xl"
                    onSubmit={handleJoin}
                >
                    <input
                        className="px-6 py-4 rounded-md outline-0 border-2 border-gray-400 hover:border-blue-500 focus:border-blue-600"
                        type="text"
                        id="username"
                        placeholder="Username"
                        required
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                    />

                    <button type="submit" className="px-6 py-4 rounded-md text-white bg-blue-500 hover:bg-blue-600 active:hover:bg-blue-700">
                        Join Chat
                    </button>
                </form>
            </div>
        )
    }


    return (
        <div className="w-full h-full flex flex-col justify-center items-center">
            <div className="max-w-[1024px] w-[80%] h-[80%] flex flex-col bg-white shadow-md rounded-xl">

                <div className="gap-2 border-b border-gray-300 px-6 py-4">
                    <h1 className="text-2xl mb-2">Chat Room</h1>
                    <p className="text-gray-500">Welcome, {username}</p>
                </div>

                <div className="flex-grow overflow-y-auto">
                    {messages.map((msg, index) => {
                        if (msg.sender === "system") {
                            return (
                                <div key={index} className="flex justify-center items-center m-2">
                                    <p className="text-sm text-gray-600 bg-gray-100 px-6 py-2 rounded-md">
                                        {msg.content}
                                    </p>
                                </div>
                            )
                        }

                        return (
                            <div
                                key={index}
                                className={`my-4 px-6 ${msg.sender === username ? "text-right" : "text-left"}`}
                            >
                                <div className={`inline-block min-w-[25%] px-6 py-3 rounded-xl ${msg.sender === username ? "bg-blue-100" : "bg-gray-100"}`}>

                                    <p className="text-sm font-medium mb-2">{msg.sender}</p>

                                    <p className="text-md">{msg.content}</p>

                                    <p className="text-xs text-gray-500 mt-2">
                                        {new Date(msg.timestamp).toLocaleTimeString()}
                                    </p>
                                </div>
                            </div>
                        )
                    })}

                    <div ref={messageEndRef} />
                </div>

                <form
                    className="flex flex-col gap-2 px-6 py-4 text-xl"
                    onSubmit={handleSend}
                >
                    <input
                        className="px-6 py-4 rounded-md outline-0 border-2 border-gray-400 hover:border-blue-500 focus:border-blue-600"
                        type="text"
                        placeholder="Enter your message..."
                        value={messageInput}
                        onChange={e => setMessageInput(e.target.value)}
                    />

                    <button type="submit" className="px-6 py-4 rounded-md text-white bg-blue-500 hover:bg-blue-600 active:hover:bg-blue-700">
                        Send
                    </button>
                </form>
            </div>
        </div>
    )
}
