import { createWriteStream } from "fs"
import DomainCrawler, { ICrawler } from "./crawlers"

export interface ICrawlerFactory {
  create(domain: URL): ICrawler
}

export default class DomainCrawlerFactory implements ICrawlerFactory {
  public create(domain: URL): DomainCrawler {
    const path = "./.turbocrawl/crawled"
    const filepath = `${path}/${domain.host}.ndjson`
    const consumer = createWriteStream(filepath)
    consumer.setMaxListeners(10000)
    return new DomainCrawler(domain, consumer)
  }
}
