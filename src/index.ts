import MetadataScraper, {IScraper} from "./scrapers"
import TurboCrawlServer from "./server"
import DomainCrawler, {ICrawler} from "./crawlers"
import SitemapLinkDetector, {ILinkDetector} from "./detectors"
import DomainCrawlerFactory, {ICrawlerFactory} from "./factories"
import FileConsumer, {ICrawlConsumer} from "./consumers"
import HTTPURLHandler, {IURLHandler} from "./url_handlers"

export = {
  MetadataScraper,
  DomainCrawler,
  TurboCrawlServer,
  DomainCrawlerFactory,
  FileConsumer
}