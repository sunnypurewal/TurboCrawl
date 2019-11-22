import { EventEmitter } from "events";
import hittp from "hittp";
import { Readable, Transform, Writable } from "stream";
import { v4 as uuidv4 } from "uuid"
import IDetectorFactory, {SitemapDetectorFactory} from "./detectors";
import IScraperFactory, { MetadataScraper } from "./scrapers"
import HTTPURLHandler, {IURLHandler} from "./url_handlers";

export interface ICrawler extends EventEmitter {
  id: string
  detector: IDetectorFactory
  consumer: Writable
  urlHandler: IURLHandler
  scraper: IScraperFactory
  domain: URL
  start(): void
  // pause(): void
  // resume(): void
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
  public detector: IDetectorFactory
  public consumer: Writable
  public urlHandler: IURLHandler
  public scraper: IScraperFactory
  public id: string
  private detectorStreams: Readable[] = []
  private linkCount: number = 0
  private responseCount: number = 0
  constructor(domain: URL,
              consumer: Writable,
              scraper?: IScraperFactory,
              detector?: IDetectorFactory,
              urlHandler?: IURLHandler) {
      super()
      this.domain = domain
      this.detector = detector || new SitemapDetectorFactory()
      this.consumer = consumer
      this.urlHandler = urlHandler || new HTTPURLHandler()
      this.scraper = scraper || new MetadataScraper()
      this.id = uuidv4()
  }

  public start() {
    const startDate = new Date(Date.now() - (1000 * 60 * 60 * 24 * 2)) // 2 days ago
    const stream = this.detector.create(this.domain, {startDate})
    this.handleURLStream(stream)
    this.detectorStreams.push(stream)
    // this.detector.on("data", (chunk) => {
    //   const chunkstring = chunk.toString()
    //   const url: URL = hittp.str2url(chunkstring.split("||")[0])
    //   this.handleURL(url)
    // })
    // /**
    //  * listen for hittp emptied event
    //  */
  }

  public handleURLStream(urlstream: Readable) {
    urlstream.on("data", (url: URL) => {
      this.urlHandler.stream(url, (url, htmlstream, err) => {
        if (htmlstream) {
          this.handleHTMLStream(htmlstream, url)
        }
        // this.responseCount += 1
        // if (this.responseCount === this.linkCount) {
        //   this.consumer.destroy()
        //   this.emit("exit")
        // }
      })
    })
    urlstream.on("error", (err) => {
      console.error("Error detecting URLS for", this.domain.href, err.message)
    })
  }

  public handleHTMLStream(htmlstream: Readable, url: URL) {
    const scraper = this.scraper.create({url})
    htmlstream.pipe(scraper).pipe(this.consumer, {end: false})
    htmlstream.on("error", (err) => {
      scraper.end()
    })
  }

  // public pause() {
  //   this.detector.pause()
  // }

  // public resume() {
  //   if (this.detector.listenerCount("data") > 0) {
  //     this.detector.resume()
  //   }
  // }

  public exit() {
    this.consumer.end()
    this.detectorStreams.forEach((s) => s.destroy())
    this.emit("exit")
  }
}
