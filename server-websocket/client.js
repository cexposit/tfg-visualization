const WebSocket = require('ws')
const url = 'ws://localhost:8181'
const connection = new WebSocket(url)
 
connection.onopen = () => {
  connection.send('Hello! Message from client') 
}
 
connection.onerror = (error) => {
  console.log(`WebSocket error: ${error}`)
}
 
connection.onmessage = (e) => {
  console.log(e.data)
}