const WebSocket = require("ws")

const errors = require("../errors.js")

const log = require("debug")("ChessWebsite:WebSockets")

class WebSocketServer {
  constructor(express, wshandler){
    this.QUICKPASS_TIME_LIMIT = 1000 * 15

    express.connectWebsocket(this)

    let httpServer = express.http
    this.WebSocketHandler = wshandler

    this.decoder = new TextDecoder();

    this.quickPassStorage = new Map()

    log("Creating websocket server...")
    this.wss = new WebSocket.Server({ server: httpServer })

    this.wss.on("connection", (ws)=>{
      // console.dir(ws)
      log("Hello, someone who just connected!")

      ws.isAuthorized = false
      ws.userType     = null
      ws.userId       = null

      let userData = null

      setTimeout(()=>{
        if(ws.isAuthorized == false){
          ws.close();
        }
      }, 1000 * 15)

      ws.on("message", async function(event){
        let JSONMessage = this.decoder.decode(event)

        // log(JSONMessage)

        let message = JSON.parse(JSONMessage)

        // log(message)


        if(ws.isAuthorized == false && message.event == "authorize"){
          if(message.pass == false) return

          let data = this.authorizeUser(message.pass)

          // log(data)

          if(data == null) return

          ws.isAuthorized = true
          ws.userType = data.type
          ws.userId   = data.id
          userData = data

          log(`User successfully authorized! ${ws.userData}`)
          
          ws.send(JSON.stringify({ event: "websocketStatus", status: "Authorized" }))

          return; 
        }


        log(message)

        if(!message.event) return;

        let handler = this.WebSocketHandler.functions.get(message.event)
        log(handler)

        let payload = {
          data: userData,
          socket: ws,
          message: message
        }


        let result = await handler(payload)

        if(result == null) return;

        ws.send(JSON.stringify(result))
      }.bind(this))
    })
  }

  authorizeUser(pass){
    let data = this.quickPassStorage.get(pass)

    log("[authorizeUser]", data)

    if(!data) return null

    log("[authorizeUser]", data.time, Date.now())
    if(Date.now() - data.time > this.QUICKPASS_TIME_LIMIT) return null

    this.quickPassStorage.delete(pass)

    return data
  }
}

module.exports = WebSocketServer