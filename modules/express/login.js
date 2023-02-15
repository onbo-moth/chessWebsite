const crypto = require("crypto")

const errors = require("../errors.js")

const log = require("debug")("ChessWebsite:LoginManager")

class LoginManager {
  constructor(database){
    this.database = database;
  }

  validateUsername(username){
    if(username.length < 4 || username.length > 20){
      return "EUSRBADLENGTH"
    }

    const regexUsernameTest = /^[a-zA-Z0-9_-]+$/g
    if(regexUsernameTest.test(username) == false){
      return "EUSRBADCHARS"
    }

    return null
  }

  validatePlainPassword(password){
    if(password.length < 8){
      return "EPWDBADLENGTH"
    }

    return null
  }

  async isUsernameTaken(username){
    if(this.database == null) return "EDBNOTCONNECTED"

    if(await this.database.isUsernameTaken(username)){
      return "EUSRTAKEN"
    }

    return null
  }


  generatePasswordHash(password){
    let hash = crypto.createHash("sha256")
                     .update(process.env.SHA_SALT + password)
                     .digest("hex")

    return hash
  }


  async registerUser(username, password){
    const usernameValid = this.validateUsername(username)
    if(usernameValid) return usernameValid

    const usernameTaken = await this.isUsernameTaken(username)
    if(usernameTaken) return usernameTaken

    const passwordValid = this.validatePlainPassword(password)
    if(passwordValid) return passwordValid

    const hash = this.generatePasswordHash(password)

    try {
      return await this.database.registerUser(username, hash)
    } catch (error) {
      if(Object.keys(errors).indexOf(error) != -1) return error
      else {
        log("Error in registerUser: " + error)
        return "EINTERNALERROR"
      }
    }
  }

  async loginUser(username, password){
    const usernameValid = this.validateUsername(username)
    if(usernameValid) return usernameValid

    const passwordValid = this.validatePlainPassword(password)
    if(passwordValid) return passwordValid

    const hash = this.generatePasswordHash(password)

    try {
      return await this.database.validateCredientals(username, hash)
    } catch (error) {
      if(Object.keys(errors).indexOf(error) != -1) return error
      else {
        log("Error in registerUser: " + error)
        return "EINTERNALERROR"
      }
    }
  }
}

module.exports = LoginManager