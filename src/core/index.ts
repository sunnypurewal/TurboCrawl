import DomainCrawler from "./crawlers"
import DomainCrawlerFactory from "./factories"
import IScraperFactory from "./scrapers"
import ICrawlConsumer, { FileConsumer } from "./consumers"
import ILinkDetector, { SitemapLinkDetector } from "./detectors"

export default {
  DomainCrawler,
  DomainCrawlerFactory,
  IScraperFactory,
  ICrawlConsumer,
  FileConsumer,
  ILinkDetector,
  SitemapLinkDetector
}