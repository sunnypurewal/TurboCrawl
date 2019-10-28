/**
 * The DomainCrawler class is responsible for crawling a single website.
 * It takes a root domain as input (e.g. "reuters.com")
 * @remarks
 * The root domain is run through each {@link LinkDetector}
 * There is a single URLHandler that processes the
 * URL and emits a {@link WebPage | "url, html"} object
 */
import { Scraper, URLHandler, Crawler } from "../../interface";
import { EventEmitter } from "events";
import { Readable, Writable } from "stream";
import SitemapLinkDetector from "../link_detectors/sitemap";
import HTTPURLHandler from "../url_handlers/http";
import hittp from "hittp";
import MetadataScraper from "../scrapers/metadata";
import { v4 as uuidv4 } from "uuid"

hittp.configure({cachePath: "./.cache"})
export default class DomainCrawler extends EventEmitter implements Crawler {
  domain: URL
  detector: Readable
  consumer: Writable
  urlHandler: URLHandler
  scraper: Scraper
  public get id(): string {
    return this._id
  }
  private _id: string
  constructor(domain: URL, consumer: Writable, scraper?: Scraper, detector?: Readable, urlHandler?: URLHandler) {
      super()
      this.domain = domain
      this.detector = detector || new SitemapLinkDetector(this.domain, {startDate: new Date(Date.now()-86400)})
      this.consumer = consumer
      this.urlHandler = urlHandler || new HTTPURLHandler()
      this.scraper = scraper || new MetadataScraper()
      this._id = uuidv4()
  }

  start() {
    this.detector.on("end", () => {
      console.log("Link detector has finished queueing requests for", this.domain.href)
    })
    // this.detector.on("close", () => {
    //   console.log("Link detector closed", this.domain.href)
    // })
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
    // console.log("Link detector paused", this.domain.href)
    this.detector.pause()
  }

  resume() {
    if (this.detector.listenerCount("data") > 0) {
      // console.log("Link detector resumed", this.domain.href)
      this.detector.resume()
    }
  }

  exit() {
    // console.log("Link detector destroy", this.domain.href)
    this.detector.destroy()
    this.consumer.destroy()
    this.emit("exit")
  }
}