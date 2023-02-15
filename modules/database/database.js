const sqlite3 = require("sqlite3")

const log = require("debug")("ChessWebsite:SQLite")

class DatabaseManager {
  constructor(sqlcache){
    this.sqlcache = sqlcache

    const RESET_TABLES = false;

    log("Creating SQLite3 database object...")
    this.database = new sqlite3.Database("../default.db")

    log("Loading SQLCache scripts...")
    this.sqlcache.loadFiles("ALL")

    if(RESET_TABLES){
      log("Dropping all tables due to reset flag...")

      this.database.run(
        this.sqlcache.getScript("reset"),
        [],
        (error, _)=>{
          if(error) console.error(error)
        }
      )
    }

    log("Initializing tables (if not existing or reset)...")
    this.database.run(
      this.sqlcache.getScript("init"),
      [],
      (error, _)=>{
        if(error) console.error(error)
      }
    )
  }

  registerUser(username, password){
    return new Promise((resolve, reject)=>{
      this.database.run(
        this.sqlcache.getScript("register"),
        [null, username, password, Date.now()],
        (error, _)=>{
          if(error) reject(error)

          resolve(null)
        })
    })
  }

  validateCredientals(username, password){
    return new Promise((resolve, reject)=>{
      this.database.get(
        this.sqlcache.getScript("login"), 
        [username, password], 
        (error, result)=>{
          if(error) reject(error)

          if(result == undefined){
            reject("EBADCREDIENTALS")
          }

          resolve(null)
      })
    })
  }

  isUsernameTaken(username){
    return new Promise((resolve, reject)=>{
      this.database.get(
        this.sqlcache.getScript("usernametaken"),
        [username],
        (error, row)=>{
          if(error) reject(error)
          // row is Undefined if theres nothing found
          resolve((row != undefined))
      })
    })
  }

  getPublicData(username){
    return new Promise((resolve, reject)=>{
      this.database.get(
        this.sqlcache.getScript("getpublicdata"),
        [username],
        (error, row)=>{
        if(error) reject(error)

        if(row.length == 0) resolve(null)
        resolve(row)
      })
    })
  }
}

module.exports = DatabaseManager