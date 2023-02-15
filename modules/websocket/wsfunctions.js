const WSFunctions = {
  "ping": {
    requires: [],         // Required objects (database, etc.)
    function: function(objects, message){ // Function
      return `Pong! ${JSON.stringify(message)}`
    }
  },

  "dbstatus": {
    requires: ["database"],
    function: function(objects, message){
      console.log(objects)
      return null
    }
  },

  "async": {
    requires: [],
    function: async function(objects, message){
      await new Promise(resolve => setTimeout(resolve, 3000))
      return "oh hi"
    }
  },

  "chatConnect": {
    requires: ["chatmanager"],
    function: function(objects, event){
      // message:
      // socket
      // chatName

      let chats = objects.chatmanager.listChats()

      if(chats.indexOf(event.message.chatName) == -1){
        let payload = {
          error: "ECHATNOTFOUND"
        }

        return JSON.stringify(payload)
      }


      let chat = objects.chatmanager.chats.get(event.message.chatName)

      if(chat.isSocketConnected(event.socket)){
        let payload = {
          error: "ECHATCONNECTED"
        }

        return payload
      }

      chat.connectSocket(event.socket)

      let payload = {
        event: "chatConnect",
        message: "Successfully connected",
        chatName: event.chatName
      }

      return payload
    }
  },

  "chatMessage": {
    requires: ["chatmanager"],
    function: function(objects, event){
      console.dir(event)

      // message:
      // socket
      // content
      // chatName

      if(event.message.content == ""){
        let payload = {
          error: "EMSGCONTENTEMPTY"
        }

        return payload
      }

      let chats = objects.chatmanager.listChats()

      if(chats.indexOf(event.message.chatName) == -1){
        let payload = {
          error: "ECHATNOTFOUND"
        }

        return payload
      }

      let chat = objects.chatmanager.chats.get(event.message.chatName)

      if(!chat.isSocketConnected(event.socket)){
        let payload = {
          error: "ECHATNOTCONNECTED"
        }

        return payload
      }

      chat.addMessage(event.data, event.message.content)

      return null
    }
  }
}

module.exports = WSFunctions