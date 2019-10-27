import { CrawlerFactory } from "../../interface"
import Crawler from "../crawlers/domain"
import FileConsumer from "../consumers/file"

export default class DomainCrawlerFactory implements CrawlerFactory {
  create(domain: URL): import("../crawlers/domain").default {
    let path = "./.turbocrawl/crawled"
    let filepath = `${path}/${domain.host}.ndjson`
    const consumer = new FileConsumer(domain, {filepath, flags: "w"})
    return new Crawler(domain, consumer)
  }
}