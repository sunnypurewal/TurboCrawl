import DomainCrawler, { ICrawler } from "./crawlers"
import FileConsumer from "./consumers"

export interface ICrawlerFactory {
  create(domain: URL): ICrawler
}

export default class DomainCrawlerFactory implements ICrawlerFactory {
  create(domain: URL): DomainCrawler {
    let path = "./.turbocrawl/crawled"
    let filepath = `${path}/${domain.host}.ndjson`
    const consumer = new FileConsumer(domain, {filepath, flags: "w"})
    return new DomainCrawler(domain, consumer)
  }
}