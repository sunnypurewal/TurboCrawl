import DomainCrawler from "./crawlers"
import IDetectorFactory, { SitemapDetectorFactory } from "./detectors"
import DomainCrawlerFactory from "./factories"
import IScraperFactory from "./scrapers"

export default {
  DomainCrawler,
  DomainCrawlerFactory,
  IDetectorFactory,
  IScraperFactory,
  SitemapDetectorFactory,
}
