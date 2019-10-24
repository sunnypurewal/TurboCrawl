import Crawler from "../crawler/crawler"
import { createServer, IncomingMessage, ServerResponse, Server, RequestListener } from "http"
import chalk from "chalk"
import { createWriteStream } from "fs"
import { Socket } from "net"
import { PORT, HOST } from "./env"
import SitemapLinkDetector from "../link_detectors/sitemap/sitemap"
import LinkDetector from "../link_detectors/detector"
import { WebPageParser, URLHandler, ParsedPageConsumer } from "../crawler/interface"
import MetaDataParser from "../crawler/parsers/metadata"
import FileConsumer from "../crawler/consumers/file"
import HTTPURLHandler from "../crawler/url_handlers/url_handler"
import { ServerOptions } from "https"
const { str2url } = require("hittp")

// const file = createWriteStream("./.turbocrawl/crawlerd", {flags: "a"})

class TurboCrawlerServer extends Server {
  private detectors: LinkDetector[]
  private parsers: WebPageParser[]
  private consumers: FileConsumer[]
  private urlHandler: URLHandler
  constructor(
    detectors: LinkDetector[],
    parsers: WebPageParser[],
    consumers: FileConsumer[],
    urlHandler: URLHandler,
    options: ServerOptions, 
    listener?: RequestListener) {
    super(options, listener)
    this.detectors = detectors
    this.parsers = parsers
    this.consumers = consumers
    this.urlHandler = urlHandler
  }
}

export default class TurboCrawler {
  private crawlers: Crawler[] = []
  private detectors: LinkDetector[] = [new SitemapLinkDetector()]
  private parsers: WebPageParser[] = [new MetaDataParser()]
  private consumers: FileConsumer[] = [new FileConsumer()]
  private urlHandler: URLHandler = new HTTPURLHandler()
  addDetector(d: LinkDetector) {
    this.detectors.push(d)
  }
  addParser(p: WebPageParser) {
    this.parsers.push(p)
  }
  addParsedPageConsumer(c: ParsedPageConsumer) {
    this.consumers.push(c)
  }
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
        let crawler = new Crawler(url, this.detectors, this.parsers, this.consumers, this.urlHandler)
        this.crawlers.push(crawler)
        crawler.on("exit", () => {
          const index = this.crawlers.findIndex((v, i, arr) => {
            return v.domain.href == url.href
          })
          console.log("Crawler exited", url)
          if (index !== -1) {
            console.log("But was not found in list")
            this.crawlers.splice(index)
          }
        })
        crawler.start()
        return
      }
      if (chunkstring === "exit") {
        console.log("Got an exit request")
        for (const crawler of this.crawlers) {
          console.log(crawler)
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