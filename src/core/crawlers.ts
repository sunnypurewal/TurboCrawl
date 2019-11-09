import { EventEmitter } from "events";
import hittp from "hittp";
import { v4 as uuidv4 } from "uuid"
import { ICrawlConsumer } from "./consumers"
import SitemapLinkDetector, {ILinkDetector} from "./detectors";
import { IScraper } from "./scrapers"
import MetadataScraper from "./scrapers";
import HTTPURLHandler, {IURLHandler} from "./url_handlers";

export interface ICrawler extends EventEmitter {
  id: string
  detector: ILinkDetector
  consumer: ICrawlConsumer
  urlHandler: IURLHandler
  scraper: IScraper
  domain: URL
  start(): void
  pause(): void
  resume(): void
  exit(): void
}

/**
 * The DomainCrawler class is responsible for crawling a single website.
 * It takes a root domain as input (e.g. "reuters.com")
 * @remarks
 * The root domain is run through each {@link LinkDetector}
 * There is a single URLHandler that processes the
 * URL and emits a {@link WebPage | "url, html"} object
 */

export default class DomainCrawler extends EventEmitter implements ICrawler {
  public domain: URL
  public detector: ILinkDetector
  public consumer: ICrawlConsumer
  public urlHandler: IURLHandler
  public scraper: IScraper
  public id: string
  constructor(domain: URL,
              consumer: ICrawlConsumer,
              scraper?: IScraper,
              detector?: ILinkDetector,
              urlHandler?: IURLHandler) {
      super()
      this.domain = domain
      const startDate = Date.parse("2019-11-07")
      this.detector = detector || new SitemapLinkDetector(this.domain, {startDate})
      this.consumer = consumer
      this.urlHandler = urlHandler || new HTTPURLHandler()
      this.scraper = scraper || new MetadataScraper()
      this.id = uuidv4()
  }

  public start() {
    this.detector.on("data", (chunk) => {
      const chunkstring = chunk.toString()
      const url: URL = hittp.str2url(chunkstring.split("||")[0])
      this.urlHandler.stream(url, (url, htmlstream, err) => {
        if (htmlstream) {
          const scraper = this.scraper.create()
          htmlstream.pipe(scraper).pipe(this.consumer, {end: false})
        }
      })
    })
    this.detector.on("end", () => {
      console.log("Detector ended")
      this.consumer.destroy()
      this.emit("exit")
    })
  }

  public pause() {
    this.detector.pause()
  }

  public resume() {
    if (this.detector.listenerCount("data") > 0) {
      this.detector.resume()
    }
  }

  public exit() {
    this.consumer.destroy()
    this.detector.destroy()
    this.emit("exit")
  }
}
