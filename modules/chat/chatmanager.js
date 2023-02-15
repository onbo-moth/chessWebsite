const Chat = require("./chat.js")

const errors = require("../errors.js")

const log = require("debug")("ChessWebsite:ChatManager")

class ChatManager {
  constructor(){

    this.chats = new Map()
  }

  createChat(name){
    log("Creating new chat:", name)
    this.chats.set(name, new Chat(name))
  }

  listChats(){
    return Array.from(this.chats.keys())
  }
}

module.exports = ChatManager