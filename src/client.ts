
import crawl, { random } from "./commands/crawl"
import { list } from "./commands/get"
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
}
