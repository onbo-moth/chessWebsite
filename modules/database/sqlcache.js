const fs   = require("fs")
const path = require("path")

const log  = require("debug")("ChessWebsite:SQLCache")

class SQLCache {
  constructor(){
    this.SQLFILESDIRECTORY = "../sql_scripts/"

    this.sqlCodes = {}
  }
  loadFiles(files){
    if(files == "ALL"){
      log("Getting all SQL files...")
      files = fs.readdirSync(path.resolve(__dirname, this.SQLFILESDIRECTORY))
    }

    log("Reading the SQL files...")
    for(let i=0; i < files.length; i++){
      let fileName   = path.resolve(__dirname, this.SQLFILESDIRECTORY) + "/" + files[i]
      let scriptName = files[i].split(".")[0]
      
      this.sqlCodes[scriptName] = fs.readFileSync(fileName, "utf-8")
    }

    return null;
  }

  getScript(name){
    if(Object.keys(this.sqlCodes).indexOf(name) == -1) return "ESQLCACHENOTFOUND"

    return this.sqlCodes[name]
  }
}

module.exports = SQLCache