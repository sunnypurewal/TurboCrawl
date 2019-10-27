import { CrawlerFactory } from "../interface"
import Crawler from "./crawler"
import FileConsumer from "./consumers/file"

export default class DefaultCrawlerFactory implements CrawlerFactory {
  create(domain: URL): import("./crawler").default {
    let path = "./.turbocrawl/crawled"
    let filepath = `${path}/${domain.host}.ndjson`
    const consumer = new FileConsumer(domain, {filepath, flags: "w"})
    return new Crawler(domain, consumer)
  }
}