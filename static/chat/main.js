var socket = new WebSocketEvents()

class Chatbox {
  constructor(htmlParent){
    this.box = document.createElement("div")
    this.box.classList.add("chatbox")

    htmlParent.appendChild(this.box)


    this.messages = document.createElement("div")
    this.messages.classList.add("chatMessages")

    this.box.appendChild(this.messages)


    this.actions = document.createElement("div")
    this.actions.classList.add("chatActions")

    this.box.appendChild(this.actions)


    this.field = document.createElement("input")
    this.field.type = "text"
    this.field.classList.add("chatInput")

    this.actions.appendChild(this.field)


    this.send  = document.createElement("button")
    this.send.classList.add("chatSend")

    this.actions.appendChild(this.send)

    this.send.addEventListener("click", this.sendMessage.bind(this))

    this.chatName = null;
  }

  connectChat(chatName){
    socket.sendEvent("chatConnect", { chatName: chatName })
  }

  sendMessage(){
    try {
    let content = this.field.value
    
    socket.sendEvent("chatMessage", { chatName: "global", content: content })

    this.field.value = ""
    } catch (e) { alert(e) }
  }

  showMessage(event){
    let div = document.createElement("div")
    div.classList.add("userMessage")

    let text = document.createElement("p")
    div.appendChild(text)

    let user = document.createElement("span")
    user.classList.add("userName")
    if(event.userType == "GUEST") user.classList.add("typeGuest")
    user.innerText = event.user + "   "
    text.appendChild(user)

    let message = document.createElement("span")
    message.classList.add("userContent")
    message.innerText = event.content
    text.appendChild(message)
    
    this.messages.appendChild(div)

    this.messages.scrollTop = this.messages.scrollHeight
  }
}

var chatbox = new Chatbox(document.getElementById("ae"))

// setInterval(()=>{chatbox.showMessage("sss", Math.floor(Math.random()*50))}, 500)

function sanitize(str){
  const out = document.getElementById("out")

  str = str.replace(/<[^>]*>/g, '')

  out.innerHTML = str
}

function insertSubstring(str, index, substr){
  let first  = str.substr(0, index)
  let second = str.substr(index)

  return first + substr + second
}




// setTimeout(function(){
//   chatbox.sendMessage("global", "hello hii")
// }, 3000)