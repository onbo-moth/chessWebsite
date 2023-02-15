const form = document.getElementById("registerForm")

function submitData(){
  console.log("clicked?")
  const formData   = new FormData(form);
  let jsonData     = JSON.stringify(Object.fromEntries(formData)); 
  const XMLRequest = new XMLHttpRequest();
  XMLRequest.open("POST", "/api/login")
  XMLRequest.setRequestHeader("Content-Type", "application/json");
  console.log("Sending data...")
  XMLRequest.send(jsonData)
}