import Crawler from "../crawler/crawler"
import { createServer, IncomingMessage, ServerResponse } from "http"
import chalk from "chalk"
import { createWriteStream } from "fs"
import { Socket } from "net"

const file = createWriteStream("./.turbocrawl/crawlerd", {flags: "a"})
const DEFAULT_PORT = 8453
const DEFAULT_HOST = "127.0.0.1"

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
  
  constructor(port: number = DEFAULT_PORT, host: string = DEFAULT_HOST) {
    this._port = port
    this._host = host
  }

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
      let url = chunk.toString()
      let crawler = new Crawler(url)
      crawler.start()
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