const WebSocket = require("ws")

class Chat {
  constructor(name){
    this.name = name

    this.history = []

    this.connectedSockets = []
  }

  connectSocket(socket){
    console.log("Socket connected", socket.userData)
    this.connectedSockets.push(socket)
  }

  isSocketConnected(socket){
    return this.connectedSockets.indexOf(socket) != -1
  }

  addMessage(user, content){
    let payload = {
      user: user.id,
      userType: user.type,
      content: this.sanitizeContent(content)
    }

    if(user.type == "GUEST") payload.user = "Guest"

    this.filterDisconnectedSockets()
    this.connectedSockets.forEach(function(socket){
      socket.send(JSON.stringify({
        event: "chatMessage",
        chatName: this.name,
        message: payload
      }))
    }.bind(this))

    this.history.push(payload)
  }

  sanitizeContent(content){
    content = content.replace(/<[^>]*>/g, '')

    return content
  }

  filterDisconnectedSockets(){
    this.connectedSockets.filter(function(socket){
      return socket.readyState == WebSocket.OPEN
    })
  }
}

module.exports = Chat