function getSubmitPath(){
  const selectElement = document.getElementsByTagName("select")[0]
  return "/api/" + selectElement.value.toLowerCase()
}

function sendData(){
  const form = document.forms[0]
  const formData = new FormData(form)
  const jsonData = JSON.stringify(Object.fromEntries(formData))
  const XMLRequest = new XMLHttpRequest()

  XMLRequest.open("POST", getSubmitPath())
  XMLRequest.setRequestHeader("Content-Type", "application/json")

  XMLRequest.send(jsonData)
}

function logoutUser(){
  const XMLRequest = new XMLHttpRequest()

  XMLRequest.open("POST", "/api/logout")
  XMLRequest.setRequestHeader("Content-Type", "application/json")

  XMLRequest.send()
}

function parseCookies(){
  let cookies = new Map()

  let cookieArray = document.cookie.split(";")
  cookieArray = cookieArray.map((value)=>{
    return value.split("=")
  })

  cookieArray = cookieArray.forEach((value)=>{
    console.log(value[0], JSON.parse(decodeURIComponent(value[1])))
    cookies.set(value[0], JSON.parse(decodeURIComponent(value[1])))
  })

  console.log(cookies)
  return cookies
}

function refreshCookieView(){
  const iframe = document.getElementsByTagName("iframe")[0]
  const iframeWindow = iframe.contentWindow

  let cookies = parseCookies();
  let cookieStr = ""

  cookies.forEach((value, key)=>{
    cookieStr += `${key} => ${JSON.stringify(value, null, 2)}\n`
  })

  iframeWindow.document.write(`<pre>${cookieStr}</pre>`)
}