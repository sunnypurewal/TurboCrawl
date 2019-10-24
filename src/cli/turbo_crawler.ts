import Crawler from "../crawler/crawler"
import { createServer, IncomingMessage, ServerResponse } from "http"
import chalk from "chalk"
import { createWriteStream } from "fs"
import { Socket } from "net"
import { PORT, HOST } from "./env"
const { str2url } = require("hittp")

// const file = createWriteStream("./.turbocrawl/crawlerd", {flags: "a"})

export default class TurboCrawler {
  private server = createServer()
  public get port(): number {
    return this._port
  }
  public get host(): string {
    return this._host
  }
  private _port: number
  private _host: string
  
  constructor(port: number = PORT, host: string = HOST) {
    this._port = port
    this._host = host
  }

  private _crawlers: Crawler[] = []

  start(callback: ()=>void) {
    this.server.on("request", this.onrequest)
    this.server.on("close", this.onclose)
    this.server.on("connect", this.onconnect)
    this.server.on("clientError", this.onclienterror)
    this.server.listen(this.port, this.host, () => {
      callback()
    }, )
  }

  onrequest(req: IncomingMessage, res: ServerResponse) {
    req.on("data", (chunk) => {
      let chunkstring = chunk.toString()
      const url = str2url(chunkstring)
      if (url) {
        let crawler = new Crawler(url)
        crawler.start()
        return
      }
      if (chunkstring === "pause") {

      }
    })
    req.on("end", () => {
      res.writeHead(200, {"Content-Type": "application/json"})
      res.write(JSON.stringify({success: true}))
      res.end("And some more")
    })
  }

  onconnect(req: IncomingMessage, socket: Socket, head: Buffer) {
    console.log("TurboCrawler received connection")
  }

  onclienterror(err: any, socket: Socket) {
    console.error("Client Error", err)
  }

  onclose() {
    console.log("TurboCrawler closed connection")
  }

}