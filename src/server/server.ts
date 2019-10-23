import express from "express"
import { Request, Response, Dictionary } from "express-serve-static-core"

export default class TurboServer {
  server: express.Express
  constructor(options: any) {
    options = options || {}
    this.server = express()
    this.server.get("*", (req, res) => {
      
    })
  }
}