import { FileConsumer } from "./consumers"
import DomainCrawler, { ICrawler } from "./crawlers"
import { createWriteStream } from "fs"

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
