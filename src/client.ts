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

  public random(callback: (url?: URL) => void) {
    commands.random(this.port, this.host, callback)
  }

  public crawlNationalNews(country: string) {
    commands.crawlNational(this.port, this.host, country)
  }

  public listCrawlers(callback: (crawlers: any) => void) {
    commands.list(this.port, this.host, callback)
  }

  public generate(name: string, callback: (count: number) => void) {
    if (name === "reddit") {
      commands.genreddit(callback)
    } else if (name === "countries") {
      commands.gencountries(callback)
    }
  }

  public end(urls: URL[], callback: (success: boolean) => void) {
    commands.end(this.port, this.host, urls, callback)
  }
  public pause(urls: URL[], callback: (success: boolean, err?: Error) => void) {
    commands.pause(this.port, this.host, urls, callback)
  }
  public resume(urls: URL[], callback: (success: boolean, err?: Error) => void) {
    commands.resume(this.port, this.host, urls, callback)
  }

  public endall(callback: (success: boolean, err?: Error) => void) {
    commands.endall(this.port, this.host, callback)
  }
  public pauseall(callback: (success: boolean, err?: Error) => void) {
    commands.pauseall(this.port, this.host, callback)
  }
  public resumeall(callback: (success: boolean, err?: Error) => void) {
    commands.resumeall(this.port, this.host, callback)
  }
}
