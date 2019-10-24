import Crawler from "../crawler/crawler"
import { createServer, IncomingMessage, ServerResponse, Server, RequestListener } from "http"
import { Socket } from "net"
import { PORT, HOST } from "./env"
import SitemapLinkDetector from "../link_detectors/sitemap"
import MetaDataParser from "../crawler/parsers/metadata"
import FileConsumer from "../crawler/consumers/file"
import HTTPURLHandler from "../crawler/url_handlers/url_handler"
const { str2url } = require("hittp")

export default class TurboCrawler {
  private crawlers: Crawler[] = []
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

  start(callback: ()=>void) {
    this.server.on("request", this.onrequest.bind(this))
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
        console.log("Turbo Crawl starting crawl on ", url.href);
        
        let crawler = new Crawler(url,
          SitemapLinkDetector.create(url, {startDate: Date.parse("2019-10-21")}),
          new MetaDataParser(), 
          FileConsumer.create(`./${url.host}.turbocrawl`, {flags: "a"}), 
          new HTTPURLHandler())
        this.crawlers.push(crawler)
        crawler.on("exit", () => {
          console.log("Crawler exited", url)
          const index = this.crawlers.findIndex((v) => {
            return v.domain.href == url.href
          })
          if (index !== -1) {
            console.log("But was not found in list")
            this.crawlers.splice(index)
          }
        })
        crawler.start()
      }
      if (chunkstring === "exit") {
        console.log("Got an exit request")
        for (const crawler of this.crawlers) {
          crawler.exit()
        }
        this.server.close((err) => {
          console.log("Turbo Crawl server closed")
          if (err) console.error(err)
        })
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