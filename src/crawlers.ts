import { EventEmitter } from "events";
import { Readable, Writable } from "stream";
import SitemapLinkDetector, {ILinkDetector} from "./detectors";
import HTTPURLHandler, {IURLHandler} from "./url_handlers";
import hittp from "hittp";
import MetadataScraper, {IScraper} from "./scrapers";
import {ICrawlConsumer} from "./consumers"
import { v4 as uuidv4 } from "uuid"

export interface ICrawler extends EventEmitter {
  start(): void
  pause(): void
  resume(): void
  exit(): void
  id: string
  detector: ILinkDetector
  consumer: ICrawlConsumer
  urlHandler: IURLHandler
  scraper: IScraper
  domain: URL
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
  domain: URL
  detector: ILinkDetector
  consumer: ICrawlConsumer
  urlHandler: IURLHandler
  scraper: IScraper
  public get id(): string {
    return this._id
  }
  private _id: string
  constructor(domain: URL, consumer: ICrawlConsumer, scraper?: IScraper, detector?: ILinkDetector, urlHandler?: IURLHandler) {
      super()
      hittp.configure({cachePath: "./.cache"})
      this.domain = domain
      this.detector = detector || new SitemapLinkDetector(this.domain, {startDate: new Date(Date.now()-86400)})
      this.consumer = consumer
      this.urlHandler = urlHandler || new HTTPURLHandler()
      this.scraper = scraper || new MetadataScraper()
      this._id = uuidv4()
  }

  start() {
    this.detector.on("data", (chunk) => {
      let chunkstring = chunk.toString()
      const url: URL = hittp.str2url(chunkstring.split("||")[0])
      this.urlHandler.stream(url, (url, htmlstream, err) => {
        if (htmlstream) {
          const scraper = this.scraper.create()
          htmlstream.pipe(scraper).pipe(this.consumer, {end: false})
        }
      })
    })
  }

  pause() {
    this.detector.pause()
  }

  resume() {
    if (this.detector.listenerCount("data") > 0) {
      this.detector.resume()
    }
  }

  exit() {
    this.detector.destroy()
    this.consumer.destroy()
    this.emit("exit")
  }
}