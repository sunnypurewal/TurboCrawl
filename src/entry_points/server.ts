import { createServer, IncomingMessage, ServerResponse } from "http"
import { Socket } from "net"
import { PORT, HOST } from "../env"
import chalk from "chalk"
import { accessSync, mkdirSync } from "fs"
import { CrawlerFactory, Crawler } from "../interface"
import DefaultCrawlerFactory from "../core/factories/domain"
import { str2url } from "hittp"
const log = console.log

export default class Server {
  private crawlers: Crawler[] = []
  private crawlerFactory: CrawlerFactory
  private server = createServer()
  public get port(): number {
    return this._port
  }
  public get host(): string {
    return this._host
  }
  private _port: number
  private _host: string
  
  constructor(port: number = PORT, host: string = HOST, crawlerFactory: CrawlerFactory = new DefaultCrawlerFactory()) {
    this._port = port
    this._host = host
    this.crawlerFactory = crawlerFactory
  }

  start(callback: ()=>void) {
    let path = "./.turbocrawl/crawled"
    try {
      accessSync(path)
    } catch (err) {
      mkdirSync(path, {recursive: true})
    }
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
            let crawlerstrings: any = this.crawlers.map((c) => {
              return {id: c.id}
            }) || []
            crawlerstrings = JSON.stringify({crawlerstrings})
            response.writeHead(200, {"Content-Type": "application/json",
                                     "Content-Length": crawlerstrings.length})
            response.write(crawlerstrings)
            response.end()
          } catch (err) {
            // console.error(err)
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
          response.setHeader("content-type", "application/json")
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

          log("Crawling", urls.length, urls.length > 1 ? "URLs" : "URL")
          let path = "./.turbocrawl/crawled"
          for (let url of urls) {
            const crawler = this.crawlerFactory.create(url)
            this.crawlers.push(crawler)
            crawler.on("exit", () => {
              console.log("Crawler exited", url.href)
            })
            crawler.start()
          }
          response.statusCode = 200
          response.write(JSON.stringify({success:true}))
          response.end()
        } else if (urlcopy === "/end") {
          let ids: string[] = []
          if (body.length) {
            // const random = Math.floor(Math.random() * body.length)
            for (let idstring of body/*.slice(random, random + 2)*/) {
              if (idstring && idstring.length > 0) {
                ids.push(idstring)
              }
            }
          } else {
            let idstring = body["id"]
            if (idstring && idstring.length > 0) {
              ids.push(idstring)
            }
          }
          for (let id of ids) {
            let index = this.crawlers.findIndex((v) => {
              return v.id === id
            })
            if (index !== -1) {
              const crawler = this.crawlers.splice(index, 1)[0]
              crawler.exit()
            }
          }
          response.statusCode = 200
          response.end()
        } else if (urlcopy === "/endall") {
          this.crawlers.forEach(c=>c.exit())
          this.crawlers = []
          response.statusCode = 200
          response.end()
        } else if (urlcopy === "/pauseall") {
          this.crawlers.forEach(c=>c.pause())
          this.crawlers = []
          response.statusCode = 200
          response.end()
        } else if (urlcopy === "/resumeall") {
          this.crawlers.forEach(c=>c.resume())
          this.crawlers = []
          response.statusCode = 200
          response.end()
        }
        else if (urlcopy === "/pause") {
          let id = body["id"]
          if (id && id.length > 0) {
            let index = this.crawlers.findIndex((v) => {
              return v.id === id
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
          } else {
            response.statusCode = 400
            response.end()
          }
        } else if (urlcopy === "/resume") {
          let id = body["id"]
          if (id && id.length > 0) {
            let index = this.crawlers.findIndex((v) => {
              return v.id === id
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
          } else {
            response.statusCode = 400
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
    log(chalk.blueBright("Turbo Crawl has exited"))
  }

}