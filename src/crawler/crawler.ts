/**
 * The Crawler class is responsible for crawling a single website.
 * It takes a root domain as input (e.g. "reuters.com")
 * @remarks
 * The root domain is run through each {@link LinkDetector}
 * There is a single URLHandler that processes the
 * URL and emits a {@link WebPage | "url, html"} object
 */
import { Scraper, URLHandler } from "../interface";
import { EventEmitter } from "events";
import MetaDataParser from "./parsers/metadata";
import { Readable, Writable } from "stream";
import SitemapLinkDetector from "./link_detectors/sitemap";
import HTTPURLHandler from "./url_handlers/url_handler";
import hittp from "hittp";
import MetadataScraper from "./parsers/metadata";

hittp.configure({cachePath: "./.cache"})
export default class Crawler extends EventEmitter {
  public domain:URL
  private detector: Readable
  private consumer: Writable
  private urlHandler: URLHandler
  private scraper: Scraper
  constructor(domain: URL, consumer: Writable, scraper?: Scraper, detector?: Readable, urlHandler?: URLHandler) {
      super()
      this.domain = domain
      this.detector = detector || new SitemapLinkDetector(this.domain, {startDate: new Date(Date.now()-86400)})
      this.consumer = consumer
      this.urlHandler = urlHandler || new HTTPURLHandler()
      this.scraper = scraper || new MetadataScraper()
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