import { useEffect } from "react"
import { useRef } from "react"
import { useState } from "react"



function ChatRoom(){
    const [socket , setSocket] = useState(null)
    const [username, setUsername] = useState("")
    const [messages, setMessages] = useState([])
    const [input , setInput] = useState("")
    const [askedUsername, setAskedUsername] = useState(true)
    const messagesEndRef = useRef(null)

    useEffect(() => {
        const ws = new WebSocket('ws://localhost:8080')
        setSocket(ws)

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data)

            if (data.type === "request-username") {
                setAskedUsername(true)
            } else if(data.type === "message" || data.type === "notification"){
                setMessages((prev) => [...prev, data])
            }
        }

        return () => ws.close()
    },[])


    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({behaviour: "smooth"})
    }, [messages])


    const sendMessage = () => {
        if (input.trim && socket) {
             socket.send(JSON.stringify({ type: "message", text: input }))
            setInput("")
        }
    }

    const sendUsername = () => {
        if (username.trim && socket) {
            socket.send(JSON.stringify({type:"set-username", username}))
            setAskedUsername(false)
        }
    }

    if (askedUsername) {
        return(
              <div className="bg-white p-4 rounded-2xl shadow w-96">
        <h2 className="text-xl mb-2">Enter your username</h2>
        <input
          className="border p-2 w-full rounded mb-2"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded w-full"
          onClick={sendUsername}
        >
          Join Chat
        </button>
      </div>
        )
    }

    return(
          <div className="bg-white p-4 rounded-2xl shadow w-[400px] flex flex-col">
      <h2 className="text-xl mb-2">Live Chat Room</h2>
      <div className="flex-1 overflow-y-auto mb-2 border p-2 rounded">
        {messages.map((m, i) => (
          <div key={i} className="mb-1">
            {m.type === "notification" ? (
              <div className="text-gray-500 text-sm italic">
                [{new Date(m.timestamp).toLocaleTimeString()}] {m.text}
              </div>
            ) : (
              <div>
                <span className="font-bold">{m.username}</span>: {m.text}{" "}
                <span className="text-xs text-gray-400">
                  {new Date(m.timestamp).toLocaleTimeString()}
                </span>
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef}></div>
      </div>
      <div className="flex gap-2">
        <input
          className="border p-2 rounded flex-1"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
        />
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={sendMessage}
        >
          Send
        </button>
      </div>
    </div>
    )

}

export default ChatRoom