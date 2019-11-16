import chalk from "chalk"
import { access, mkdir, readdir } from "fs"
import { str2url } from "hittp"
import { createServer, IncomingMessage, ServerResponse } from "http"
import { Socket } from "net"
import { domainsFromFile } from "./commands/helpers"
import { ICrawler } from "./core/crawlers"
import DomainCrawlerFactory, {ICrawlerFactory} from "./core/factories"
import { HOST, PORT } from "./env"
import generateReddit from "./scripts/reddit"
import generateWikipedia from "./scripts/wikipedia"

const log = console.log

export class Response {
  public success: boolean
  constructor(success: boolean) {
    this.success = success
  }
}

export default class Server {
  private crawlers: ICrawler[] = []
  private crawlerFactory: ICrawlerFactory
  private server = createServer()
  private Port: number
  private Host: string
  public get port(): number {
    return this.Port
  }
  public get host(): string {
    return this.Host
  }

  constructor(port: number = PORT, host: string = HOST, crawlerFactory: ICrawlerFactory = new DomainCrawlerFactory()) {
    this.Port = port
    this.Host = host
    this.crawlerFactory = crawlerFactory
    mkdir("./.turbocrawl/crawled", {recursive: true}, () => {
      mkdir("./.turbocrawl/default", {recursive: true}, () => {
        mkdir("./.turbocrawl/default/domains", {recursive: true}, () => {
          // tslint:disable-next-line: no-empty
          mkdir("./.turbocrawl/default/countries", {recursive: true}, () => {})
        })
      })
    })
  }

  public close() {
    for (const crawler of this.crawlers) {
      crawler.exit()
    }
    this.server.close((err) => {
      if (err) { log(err) }
    })
  }

  public listen(callback: () => void) {
    this.server.on("request", this.onrequest.bind(this))
    this.server.on("close", this.onclose)
    this.server.on("connect", this.onconnect)
    this.server.on("clientError", this.onclienterror)
    this.server.listen(this.port, this.host, () => {
      callback()
    } )
  }

  private onrequest(request: IncomingMessage, response: ServerResponse) {
    response.on("error", (err) => {
      log(err)
    })
    const { headers, method, url } = request;
    let body: any = [];
    const urlcopy = url ? url.slice() : ""
    // console.log(headers, method, url)
    request.on("error", (err) => {
      log(err);
      response.statusCode = 400
      response.end()
    }).on("data", (chunk) => {
      body.push(chunk);
    }).on("end", () => {
      body = Buffer.concat(body).toString();
      if (method === "GET") {
        if (urlcopy === "/list") {
          try {
            let crawlerstrings: any = this.crawlers.map((c) => {
              return c.domain
            }) || []
            crawlerstrings = JSON.stringify({crawlerstrings})
            response.writeHead(200, {
              "Content-Length": crawlerstrings.length,
              "Content-Type": "application/json",
            })
            response.write(crawlerstrings)
            response.end()
          } catch (err) {
            // console.error(err)
            response.statusCode = 400
            response.end()
          }
        } else if (urlcopy === "/exit") {
          this.close()
          response.statusCode = 200
          response.end()
        } else if (urlcopy === "/ping") {
          response.statusCode = 200
          response.end()
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
          const urls: URL[] = []
          if (body.length) {
            // const random = Math.floor(Math.random() * body.length)
            for (const urlstring of body/*.slice(random, random + 2)*/) {
              const url = str2url(urlstring)
              if (url) {
                urls.push(url)
              }
            }
          } else {
            const url = str2url(body.url)
            if (url) {
              urls.push(url)
            }
          }

          log("Crawling", urls.length, urls.length > 1 ? "URLs" : "URL")
          const path = "./.turbocrawl/crawled"
          for (const url of urls) {
            const crawler = this.crawlerFactory.create(url)
            this.crawlers.push(crawler)
            crawler.on("exit", () => {
              log("Crawler exited", url.href)
              const index = this.crawlers.findIndex((c) => {
                return c.id === crawler.id
              })
              if (index !== -1) {
                this.crawlers.splice(index, 1)
              }
            })
            crawler.start()
          }
          response.statusCode = 200
          response.write(JSON.stringify({filepath: path}))
          response.end()
        } else if (urlcopy === "/crawl") {
          if (body.random) {
            const path = "./.turbocrawl/default/domains"
            readdir(path, (err, files) => {
              const filenames = files.filter((d) => {
                return d !== undefined && d !== null && d !== path
              })
              if (filenames.length === 0) {
                console.log("Filenames is empty")
                response.statusCode = 404
                response.statusMessage = `No files were found in ${path}. Try calling /generate`
                response.end()
              } else {
                const random = Math.floor(Math.random() * filenames.length)
                const filename = filenames[random]
                const domains = domainsFromFile(`${path}/${filename}`)
                if (domains && domains.length > 0) {
                  const random = Math.floor(Math.random() * domains.length)
                  const domain = new URL(domains[random].href)
                  const crawler = this.crawlerFactory.create(domain)
                  const filepath = crawler.consumer.options.filepath
                  this.crawlers.push(crawler)
                  crawler.on("exit", () => {
                    log("Crawler exited", domain.href)
                    const index = this.crawlers.findIndex((c) => {
                      return c.id === crawler.id
                    })
                    if (index !== -1) {
                      this.crawlers.splice(index, 1)
                    }
                  })
                  crawler.start()
                  response.statusCode = 200
                  response.write(JSON.stringify({ url: domain.href, filepath }))
                  response.end()
                } else {
                  console.log("File is empty")
                  response.statusCode = 404
                  response.statusMessage = `File at ${path}/${filename} is empty.`
                  response.end()
                }
              }
            })
          } else if (body.country) {
            const path = `./.turbocrawl/default/countries/${body.country}`
            access(path, (err) => {
              if (err) {
                console.log("Countries have not been generated yet")
                response.statusCode = 404
                response.statusMessage = `${path} was not found. Try calling /generate`
                response.end()
              } else {
                const domains = domainsFromFile(path)
                for (const domain of domains) {
                  const crawler = this.crawlerFactory.create(domain)
                  this.crawlers.push(crawler)
                  crawler.on("exit", () => {
                    log("Crawler exited", domain.href)
                    const index = this.crawlers.findIndex((c) => {
                      return c.id === crawler.id
                    })
                    if (index !== -1) {
                      this.crawlers.splice(index, 1)
                    }
                  })
                  crawler.start()
                  response.statusCode = 200
                  response.write(JSON.stringify({ url: domain.href, filepath: "./.turbocrawl/crawled" }))
                  response.end()
                }
              }
            })
          }
        } else if (urlcopy === "/end") {
          const ids: string[] = []
          if (body.length) {
            // const random = Math.floor(Math.random() * body.length)
            for (const idstring of body/*.slice(random, random + 2)*/) {
              if (idstring && idstring.length > 0) {
                ids.push(idstring)
              }
            }
          } else {
            const idstring = body.id
            if (idstring && idstring.length > 0) {
              ids.push(idstring)
            }
          }
          for (const id of ids) {
            const index = this.crawlers.findIndex((c) => {
              return c.id === id
            })
            if (index !== -1) {
              const crawler = this.crawlers.splice(index, 1)[0]
              crawler.exit()
            }
          }
          response.statusCode = 200
          response.end()
        } else if (urlcopy === "/endall") {
          this.crawlers.forEach((c) => c.exit())
          this.crawlers = []
          response.statusCode = 200
          response.end()
        } else if (urlcopy === "/pauseall") {
          this.crawlers.forEach((c) => c.pause())
          this.crawlers = []
          response.statusCode = 200
          response.end()
        } else if (urlcopy === "/resumeall") {
          this.crawlers.forEach((c) => c.resume())
          this.crawlers = []
          response.statusCode = 200
          response.end()
        } else if (urlcopy === "/pause") {
          const id = body.id
          if (id && id.length > 0) {
            const index = this.crawlers.findIndex((v) => {
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
          const id = body.id
          if (id && id.length > 0) {
            const index = this.crawlers.findIndex((v) => {
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
        } else if (urlcopy === "/generate") {
          const name = body.name
          if (name === "reddit") {
            generateReddit((count, filename, err) => {
              if (err) {
                response.statusCode = 400
                response.end()
              } else {
                response.statusCode = 200
                response.write(JSON.stringify({count, filename}))
                response.end()
              }
            })
          } else if (name === "wikipedia") {
            generateWikipedia((count) => {
              response.statusCode = 200
              response.write(JSON.stringify({count}))
              response.end()
            })
          }
        }
      }
    })
  }

  private onconnect(req: IncomingMessage, socket: Socket, head: Buffer) {
    log("TurboCrawler received connection")
  }

  private onclienterror(err: any, socket: Socket) {
    log("Client Error", err)
  }

  private onclose() {
    log(chalk.blueBright("Turbo Crawl has exited"))
  }

}
