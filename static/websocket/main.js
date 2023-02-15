
class WebSocketEvents {
  constructor(){
    console.log("hello??")

    this.socket = new WebSocket('ws://' + location.host)


    this.socket.onopen = (event) => {
      console.log('WebSocket connection opened: ', event);

      this.getQuickPass().then(function(pass){
        this.sendEvent("authorize", pass)
      }.bind(this))

      return false;
    };

    this.socket.onmessage = (event) => {
      console.log('Received message from server: ', event.data);

      let message = JSON.parse(event.data)

      console.dir(message)

      if(message.event == "websocketStatus"){
        if(message.status != "Authorized") return

        chatbox.connectChat("global")
      }

      if(message.event == "chatMessage"){
        console.log("its a message")
        chatbox.showMessage(message.message)
      }

      return false;
    };

    this.socket.onclose = (event) => {
      console.log('WebSocket connection closed: ' + event);

      return false;
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket error: ', error);
      return false;
    };
  }

  sendEvent(event, content){
    console.dir(event, content)

    content.event = event
    let payload = JSON.stringify(content)

    this.socket.send(payload)
  }

  getQuickPass(){
    return new Promise(function(resolve, reject){
      let XMLRequest = new XMLHttpRequest()

      XMLRequest.open("POST", "/api/getQuickPass")
      XMLRequest.setRequestHeader("Content-Type", "application/x-www-form-urlencoded")

      XMLRequest.onload = function(){
        if(XMLRequest.status == 200){
          console.dir(XMLRequest.response)

          console.log("pass")

          resolve(JSON.parse(XMLRequest.response))
        }
      }


      XMLRequest.send()
    })
  }
}

// new WebSocketEvents()