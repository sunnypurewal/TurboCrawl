import { EventEmitter } from "events";
import hittp from "hittp";
import { Readable, Writable } from "stream";
import { v4 as uuidv4 } from "uuid"
import ICrawlConsumer from "./consumers"
import ILinkDetector, {SitemapLinkDetector} from "./detectors";
import IScraperFactory, { MetadataScraper } from "./scrapers"
import HTTPURLHandler, {IURLHandler} from "./url_handlers";

export interface ICrawler extends EventEmitter {
  id: string
  detector: ILinkDetector
  consumer: Writable
  urlHandler: IURLHandler
  scraper: IScraperFactory
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
  public consumer: Writable
  public urlHandler: IURLHandler
  public scraper: IScraperFactory
  public id: string
  private linkCount: number = 0
  private responseCount: number = 0
  constructor(domain: URL,
              consumer: Writable,
              scraper?: IScraperFactory,
              detector?: ILinkDetector,
              urlHandler?: IURLHandler) {
      super()
      this.domain = domain
      const startDate = new Date(Date.now() - (1000 * 60 * 60 * 24 * 2))
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
      this.handleURL(url)
    })
    /**
     * listen for hittp emptied event
     */
    this.detector.on("end", () => {
      this.linkCount = this.detector.getLinkCount()
      console.log("Detector detected", this.linkCount, "links")
      if (this.linkCount === 0) {
        this.consumer.destroy()
        this.emit("exit")
      }
    })
  }

  public handleURL(url: URL) {
    this.urlHandler.stream(url, (url, htmlstream, err) => {
      if (htmlstream) {
        this.handleHTMLStream(htmlstream, url)
      }
      this.responseCount += 1
      if (this.responseCount === this.linkCount) {
        this.consumer.destroy()
        this.emit("exit")
      }
    })
  }

  public handleHTMLStream(htmlstream: Readable, url: URL) {
    const scraper = this.scraper.create({url})
    htmlstream.pipe(scraper).pipe(this.consumer, {end: false})
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
