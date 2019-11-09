import commands from "./commands"

export default class Client {
  private port: number
  private host: string
  constructor(port: number, host: string, options?: any) {
    options = options || {}
    this.port = port
    this.host = host
  }

  public crawl(domains: URL[]) {
    commands.crawl(this.port, this.host, domains)
  }

  public random(callback: (statusCode: number, url?: URL) => void) {
    commands.random(this.port, this.host, callback)
  }

  public crawlNationalNews(country: string) {
    commands.crawlNational(this.port, this.host, country)
  }

  public listCrawlers(callback: (crawlers: any) => void) {
    commands.list(this.port, this.host, callback)
  }

  public generate(name: string, callback: (body: string|null, err?: Error) => void) {
    commands.generate(this.port, this.host, name, callback)
  }

  public end(urls: URL[], callback: (body: string|null, err?: Error) => void) {
    commands.end(this.port, this.host, urls, callback)
  }
  public pause(urls: URL[], callback: (body: string|null, err?: Error) => void) {
    commands.pause(this.port, this.host, urls, callback)
  }
  public resume(urls: URL[], callback: (body: string|null, err?: Error) => void) {
    commands.resume(this.port, this.host, urls, callback)
  }

  public endall(callback: (body: string|null, err?: Error) => void) {
    commands.endall(this.port, this.host, callback)
  }
  public pauseall(callback: (body: string|null, err?: Error) => void) {
    commands.pauseall(this.port, this.host, callback)
  }
  public resumeall(callback: (body: string|null, err?: Error) => void) {
    commands.resumeall(this.port, this.host, callback)
  }
}
