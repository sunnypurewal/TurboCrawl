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
    // console.log(headers, method, url)
    request.on('error', (err) => {
      console.error(err);
      response.statusCode = 400
      response.end()
    }).on('data', (chunk) => {
      body.push(chunk);
    }).on('end', () => {
      body = Buffer.concat(body).toString();
      if (method === "GET") {
        if (urlcopy === "/list") {
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
        if (urlcopy === "/") {
          let urls: URL[] = []
          if (body.length) {
            // const random = Math.floor(Math.random() * body.length)
            for (let urlstring of body/*.slice(random, random + 2)*/) {
              let url = str2url(urlstring)
              if (url) {
                urls.push(url)
              }
            }
          } else {
            let url = str2url(body["url"])
            if (url) {
              urls.push(url)
            }
          }
          console.log("Crawling", urls.length, "URLs")
          for (let url of urls) {
            const crawler = new Crawler(url.href,
              FileConsumer.create(`./.turbocrawl/crawled/${url.host}`, {flags: "a"})
              )
              this.crawlers.push(crawler)
              crawler.on("exit", () => {
                console.log("Crawler exited", url.href)
              })
              crawler.start()
              response.statusCode = 200
              response.end()
          }
        } else if (urlcopy === "/end") {
          let url = str2url(body["url"])
          console.log("Received end request", url.href)
          if (url) {
            let index = this.crawlers.findIndex((v) => {
              return v.domain.host === url.host
            })
            console.log(index)
            if (index !== -1) {
              const deleted = this.crawlers.splice(index, 1)[0]
              deleted.exit()
              response.statusCode = 200
              response.end()
            } else {
              response.statusCode = 404
              response.end()
            }
          }
        } else if (urlcopy === "/pause") {
          let url = str2url(body["url"])
          if (url) {
            let index = this.crawlers.findIndex((v) => {
              return v.domain.host === url.host
            })
            if (index !== -1) {
              const paused = this.crawlers[index]
              paused.pause()
              response.statusCode = 200
              response.end()
            } else {
              response.statusCode = 404
              response.end()
            }
          }
        } else if (urlcopy === "/resume") {
          let url = str2url(body["url"])
          if (url) {
            let index = this.crawlers.findIndex((v) => {
              return v.domain.host === url.host
            })
            if (index !== -1) {
              const deleted = this.crawlers.splice(index, 1)[0]
              deleted.resume()
              response.statusCode = 200
              response.end()
            } else {
              response.statusCode = 404
              response.end()
            }
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