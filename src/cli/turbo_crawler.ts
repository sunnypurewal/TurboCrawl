import Crawler from "../crawler/crawler"
import { createServer, IncomingMessage, ServerResponse } from "http"
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

  onrequest(request: IncomingMessage, response: ServerResponse) {
    response.on("error", (err) => {
      console.error(err)
    })

    const { headers, method, url } = request;
    let body: any = [];
    let urlcopy = url ? url.slice() : ""
    console.log(headers, method, url)
    request.on('error', (err) => {
      console.error(err);
      response.statusCode = 400
      response.end()
    }).on('data', (chunk) => {
      console.log("request data received")
      body.push(chunk);
    }).on('end', () => {
      body = Buffer.concat(body).toString();
      console.log("request end received")
      if (method === "GET") {
        if (urlcopy === "/list") {
          console.log("Received list request")
          try {
            let crawlerstrings: string|Crawler[]|string[] = this.crawlers.map((c) => {
              return c.domain.href
            }) || []
            crawlerstrings = JSON.stringify({crawlerstrings})
            response.writeHead(200, {"Content-Type": "application/json",
                                     "Content-Length": crawlerstrings.length})
            response.write(crawlerstrings)
            response.end()
          } catch (err) {
            console.error(err)
            response.statusCode = 400
            response.end()
          }
        } else if (urlcopy === "/exit") {
          for (const crawler of this.crawlers) {
            crawler.exit()
          }
          response.statusCode = 200
          response.end()
          this.server.close((err) => {
            if (err) console.error(err)
          })
        } 
      }
      if (method === "POST") {
        const contentType = headers["content-type"] || ""
        if (contentType === "application/json") {
          body = JSON.parse(body)
        } else {
          response.statusCode = 400
          response.end()
        }
        if (urlcopy === "/crawl") {
          console.log("Got a crawl request", body["url"], body.url, typeof(body), typeof(body.url))
          let url = str2url(body["url"])
          if (url) {
            const crawler = new Crawler(url,
              SitemapLinkDetector.create(url, {startDate: Date.parse("2019-10-21")}),
              new MetaDataParser(),
              FileConsumer.create(`./.turbocrawl/${url.host}`, {flags: "a"}),
              new HTTPURLHandler()
              )
              this.crawlers.push(crawler)
              crawler.on("exit", () => {
                console.log("Crawler exited", url.href)
              })
              crawler.start()
              response.statusCode = 200
              response.end()
          }
        }
      }
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