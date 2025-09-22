const { text } = require('express');
const Websocket = require('ws')
const wss = new Websocket.Server({port:8080})


const clients = new Map()

wss.on('connection', (ws) => {
    console.log('New Client Connected');
    
    ws.send(JSON.stringify({type:'request-username'}))

    ws.on('message', (msg) => {
        try {
            const data = JSON.parse(msg)       
                
            if (data.type === 'set-username') {
                clients.set(ws, data.username)
                broadcast({
                    type: 'notification',
                    text: `${data.username} joined the chat.`,
                    timestamp: new Date().toISOString()
                })
            }

            if (data.type === 'message') {
                const username = clients.get(ws) || 'Anonymous'
                 broadcast({
                    type: 'message',
                    username,
                    text: data.text,
                    timestamp: new Date().toISOString()
                 })
            }

        
        } catch (err) {
            console.error('Invalid message', err);
        }
    })

    ws.on('close', () => {
        const username = clients.get(ws) || 'Someone'
        clients.delete(ws)
        broadcast({
             type: 'notification',
             text: `${username} left the chat.`,
             timestamp: new Date().toISOString()
        })
    })
})

function broadcast(data){
    const json = JSON.stringify(data)
    for (const client of wss.clients) {
        if (client.readyState === Websocket.OPEN) {
            client.send(json)
        }
    }
}


console.log('WebSocket server running on ws://localhost:8080');

