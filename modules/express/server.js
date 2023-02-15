const express      = require("express")
const bodyParser   = require("body-parser")
const path         = require("path")
const crypto       = require("crypto")
const jwt          = require("jsonwebtoken")
const fs           = require("fs")
const cookieParser = require("cookie-parser") 
const http         = require("http")

const errors = require("../errors.js")

const log = require("debug")("ChessWebsite:Express")

console.log(process.env.JWT_SECRET)

class ExpressServer {
  constructor(database, loginmanager, usercache){
    this.database = database
    this.loginmanager = loginmanager
    this.usercache = usercache

    // Will be connected ASAP for two-way communication
    this.websocket = null

    const PORT = 8800

    log("Creating app and HTTP server...")
    this.app = express()
    this.http = http.createServer(this.app)

    this.app.use(bodyParser.json())
    this.app.use(cookieParser())

    this.app.use(this.usercache.cookieMiddle.bind(this.usercache))

    this.app.get("/", (req, res) => {
      res.sendFile(path.resolve(__dirname, "../views/index.html"))
    })

    this.app.use('/static', express.static(path.resolve(__dirname, '../static')))
    this.app.use('/dev',    express.static(path.resolve(__dirname, '../views/dev')))

    this.app.post("/api/login", this.loginUser.bind(this))
    this.app.post("/api/register", this.registerUser.bind(this))
    this.app.post("/api/logout", this.logoutUser.bind(this))

    this.app.post("/api/getQuickPass", this.getQuickPass.bind(this))


    this.http.listen(PORT, () => {
      log(`Listening in port: ${PORT}`)
    })
  }

  async loginUser(req, res){

    const loginResult = await this.loginmanager.loginUser(
      req.body.username,
      req.body.password
    )

    if(loginResult){
      res.json({
        error: loginResult,
        message: errors[loginResult]
      })
      return
    }

    const payload = {
      username: req.body.username
    }

    const token = jwt.sign(payload, process.env.JWT_SECRET)

    res.cookie("token", token, { 
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 2 // 2 hour in ms
    })

    const publicUserData = await this.database.getPublicData(req.body.username)
    res.cookie("data", JSON.stringify(publicUserData), {
      httpOnly: false,
      maxAge: 1000 * 60 * 60 * 2
    })

    this.usercache.loadUserData(req.body.username)

    res.clearCookie("guest")

    res.sendStatus(200)
  }


  async registerUser(req, res){
    const registerResult = await this.loginmanager.registerUser(
      req.body.username,
      req.body.password
    )

    if(registerResult){
      res.json({
        error: registerResult,
        message: errors[registerResult]
      })
      return
    }

    const payload = {
      username: req.body.username
    }

    const token = jwt.sign(payload, process.env.JWT_SECRET)

    res.cookie("token", token, { 
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 2 // 2 hour in ms
    })

    const publicUserData = await this.database.getPublicData(req.body.username)
    res.cookie("data", JSON.stringify(publicUserData), {
      httpOnly: false,
      maxAge: 1000 * 60 * 60 * 2
    })

    this.usercache.loadUserData(req.body.username)

    res.clearCookie("guest")

    res.sendStatus(200)
  }

  async logoutUser(req, res){
    res.clearCookie("token")
    res.clearCookie("data")

    if(!req.cookies.guest) this.usercache.assignGuestCookie(res)

    res.send("OK")
  }

  async getQuickPass(req, res){
    let userType = null
    let id       = null

    console.dir(req.cookies)

    if(req.cookies.guest){
      userType = "GUEST"
      id = req.cookies.guest.guestId
    }

    if(req.cookies.token){
      let user = this.usercache.verifyUserToken(req.cookies.token)
      if(user == null) {
        res.clearCookie("token")
        res.clearCookie("data")

        res.json({
          error: "EBADAUTH"
        })
      };

      userType = "USER"
      id = user.username
    }

    if(userType == null){
      res.json({
        error: "EBADUSRTYPE"
      })
    };
    
    let pass = crypto.randomBytes(8).toString("hex")

    let payload = {
      time: Date.now(),
      type: userType,
      id: id
    }

    this.websocket.quickPassStorage.set(pass, payload)
    log("[getQuickPass]", pass, payload)

    res.json({
      pass: pass
    })
  }

  connectWebsocket(websocket){
    this.websocket = websocket
  }
}

module.exports = ExpressServer