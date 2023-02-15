const fs   = require("fs")
const path = require("path")
const jwt  = require("jsonwebtoken")

const errors = require("../errors.js")

const log = require("debug")("ChessWebsite:UserCache")

class UserCache {
  constructor(database){
    this.database = database
    
    this.cache = new Map()
    this.inactivityLimit = 1000 * 60
    this.inactivityTimer = 1000 * 30

    this.inactivityInterval = setInterval(
      this.purgeInactiveUsers.bind(this),
      this.inactivityTimer
    )

    this.guestIdCounter = 1;
    this.guestIdFile    = path.resolve(__dirname, "../guestCount")

    log("Loading Guest ID")
    this.loadGuestID()
  }
  async cookieMiddle(req, res, next){
    // console.dir(req.cookies)
    req.cookies = this.decodeCookies(req.cookies)

    console.dir(req.cookies)

    let user = this.verifyUserToken(req.cookies.token)

    let isNew = req.cookies.guest == undefined

    if(!isNew){
      next()
      return
    }

    if((user == null) && isNew) {
      log("Unregistered user, creating guest cookie: " + this.guestIdCounter)

      this.assignGuestCookie(res)

      next()
      return
    }

    // console.log(`Username: ${user.username}`)

    let value = this.cache.get(user.username)

    if(value == undefined){
      await this.loadUserData(user.username)

      next()
      return
    } else {
      this.updateUserActivity(user.username)
    }

    next()
  }

  verifyUserToken(jwtToken){
    if(jwtToken === undefined) return null

    try {
      return jwt.verify(jwtToken, process.env.JWT_SECRET)
    } catch (e) {
      return null
    }
  }

  async loadUserData(username){
    // log("Loading user data: " + username)

    let data = await this.database.getPublicData(username)

    data.lastActivity = Date.now()

    this.cache.set(username, data)
  }

  updateUserActivity(username){
    // log("Got user activity: " + username + " at " + Date.now())

    let data = this.cache.get(username)

    data.lastActivity = Date.now()

    this.cache.set(username, data)
  }

  purgeInactiveUsers(){
    // log("Checking for inactive users...")

    // console.dir(this.cache)

    this.cache.forEach(function(value, key){
      if(Date.now() - value.lastActivity > this.inactivityLimit){
        // log("Deleting user cache: " + key)
        this.cache.delete(key)
      }
    }.bind(this))
  }

  loadGuestID(){
    if(!fs.existsSync(this.guestIdFile)){
      fs.writeFileSync(this.guestIdFile, "1")
      return;
    }

    this.guestIdCounter = parseInt(fs.readFileSync(this.guestIdFile))
  }

  saveGuestId(){
    log("Saving Guest ID due to exit..")
    fs.writeFileSync(this.guestIdFile, this.guestIdCounter)

    process.exit()
  }

  assignGuestCookie(res){
    log("Unregistered user, creating guest cookie: " + this.guestIdCounter)
    res.cookie("guest", JSON.stringify(
      {
        guestId: this.guestIdCounter
      }
    ))

    this.guestIdCounter++
  }

  decodeCookies(cookies){
    let entries = Object.entries(cookies)
    let outObject = {}

    for(let i=0; i<entries.length; i++){
      try {
        let URIDecoded = decodeURIComponent(entries[i][1])
        let JSONDecoded = JSON.parse(URIDecoded)

        outObject[entries[i][0]] = JSONDecoded
      } catch {
        outObject[entries[i][0]] = entries[i][1]
        continue;
      }
    }

    return outObject
  }
}

module.exports = UserCache