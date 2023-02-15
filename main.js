require("dotenv").config()

const ExpressServer   = require("./modules/express/server.js")

const DatabaseManager = require("./modules/database/database.js")
const SQLCache        = require("./modules/database/sqlcache.js")

const UserCache       = require("./modules/express/usercache.js")  
const LoginManager    = require("./modules/express/login.js")

const ChatManager     = require("./modules/chat/chatmanager.js")

const WebSocketHandler = require("./modules/websocket/wshandler.js")
const WebSocketServer = require("./modules/websocket/websocket.js")

const WebSocketFunctions = require("./modules/websocket/wsfunctions.js")

let sqlcache = new SQLCache()
let database = new DatabaseManager(sqlcache)

let logins = new LoginManager(database)
let usercache = new UserCache(database)
let express = new ExpressServer(database, logins, usercache)

let chatmanager = new ChatManager()

let wshandler = new WebSocketHandler()
let websocket = new WebSocketServer(express, wshandler)

chatmanager.createChat("global")

wshandler.loadRequire("database", database)
wshandler.loadRequire("chatmanager", chatmanager)

wshandler.loadFunctions(WebSocketFunctions)

function onExit(){
  usercache.saveGuestId()

  process.exit()
}

// process.on('exit', onExit)
process.on('SIGINT', onExit)
process.on('SIGUSR1', onExit)
process.on('SIGUSR2', onExit)
// process.on('uncaughtException', onExit)