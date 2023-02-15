const Errors = {

  // Request processing
  "EOBJBADKEYS": "The Object keys must only have the expected keys.",

  // Username validation
  "EUSRBADLENGTH": "Username must be between 4 and 20 characters.",
  "EUSRBADCHARS": "Username contains unallowed characters.",
  "EUSRTAKEN": "Username is already taken.",
  
  // Password validation
  "EPWDBADLENGTH": "Password must at least have 8 characters.",

  // Logging in
  "EBADCREDIENTALS": "The login credientals are incorrect",

  // Class connection errors
  "EDBNOTCONNECTED": "The required database is not connected.",

  // Special errors
  "EINTERNALERROR": "There was something wrong in the server. Oops!"
}

module.exports = Errors