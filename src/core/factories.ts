import { FileConsumer } from "./consumers"
import DomainCrawler, { ICrawler } from "./crawlers"

export interface ICrawlerFactory {
  create(domain: URL): ICrawler
}

export default class DomainCrawlerFactory implements ICrawlerFactory {
  public create(domain: URL): DomainCrawler {
    const path = "./.turbocrawl/crawled"
    const filepath = `${path}/${domain.host}.ndjson`
    const consumer = new FileConsumer(domain, {filepath, flags: "w"})
    return new DomainCrawler(domain, consumer)
  }
}
