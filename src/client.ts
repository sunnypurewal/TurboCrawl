
import crawl, { random } from "./commands/crawl"
import { list } from "./commands/get"
import { end, endall, pause, pauseall, resume, resumeall } from "./commands/manage"
import crawlNational from "./commands/news"

export default class Client {
  private port: number
  private host: string
  constructor(port: number, host: string, options?: any) {
    options = options || {}
    this.port = port
    this.host = host
  }

  public crawl(domains: URL[]) {
    crawl(this.port, this.host, domains)
  }

  public random(callback: (url?: URL) => void) {
    random(this.port, this.host, callback)
  }

  public crawlNationalNews(country: string) {
    crawlNational(this.port, this.host, country)
  }

  public listCrawlers(callback: (crawlers: any) => void) {
    list(this.port, this.host, callback)
  }

  public end(urls: URL[], callback: (success: boolean) => void) {
    end(this.port, this.host, urls, callback)
  }
  public pause(urls: URL[], callback: (success: boolean, err?: Error) => void) {
    pause(this.port, this.host, urls, callback)
  }
  public resume(urls: URL[], callback: (success: boolean, err?: Error) => void) {
    resume(this.port, this.host, urls, callback)
  }

  public endall(callback: (success: boolean, err?: Error) => void) {
    endall(this.port, this.host, callback)
  }
  public pauseall(callback: (success: boolean, err?: Error) => void) {
    pauseall(this.port, this.host, callback)
  }
  public resumeall(callback: (success: boolean, err?: Error) => void) {
    resumeall(this.port, this.host, callback)
  }
}
