
const errors = require("../errors.js")

const log = require("debug")("ChessWebsite:WebSocketHandler")

class WSHandler{
  constructor(){
    this.functions = new Map()
    this.requires  = new Map()
  }

  loadFunctions(wsfunctions){
    log("Loading functions...")

    // console.log(Object.entries(wsfunctions))

    Object.entries(wsfunctions).forEach(([fnName, details]) => {
      log(`Loading function ${fnName}`)
      this.functions.set(
        fnName,
        this.makeAsync(
          this.prepareFunction(
            this.createRequireObject(details.requires),
            details.function
          )
        )
      )
    })

    console.dir(this.functions)
  }

  callFunction(fnName, args){
    return this.functions.get(fnName)(args)
  }

  loadRequire(name, object){
    log(`Loaded require: ${name}`)
    this.requires.set(name, object)
  }

  createRequireObject(requires){
    let reqObject = {}

    requires.forEach(function(reqName){
      let object = this.requires.get(reqName)

      if(!object){
        log(`Require \"${reqName}\" not found, Skipping...`)
        return
      }

      reqObject[reqName] = object
    }.bind(this))

    return reqObject
  }

  prepareFunction(requires, fn){
    return fn.bind(fn, requires)
  }

  makeAsync(fn){
    return (async (...args) => fn(...args))
  }
}

module.exports = WSHandler