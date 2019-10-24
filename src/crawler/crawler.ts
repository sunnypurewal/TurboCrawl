/**
 * The Crawler class is responsible for crawling a single website.
 * It takes a root domain as input (e.g. "reuters.com")
 * @remarks
 * The root domain is run through each {@link LinkDetector}
 * There is a single URLHandler that processes the
 * URL and emits a {@link WebPage | "url, html"} object
 */
import { WebPageParser, ParsedPageConsumer, URLHandler } from "./interface";
import FileConsumer from "./consumers/file";
import { EventEmitter } from "events";
import MetaDataParser from "./parsers/metadata";
import { Readable } from "stream";
const { str2url } = require("hittp")

export default class Crawler extends EventEmitter {
  public domain:URL
  private detector: Readable
  private urlHandler: URLHandler
  private consumer: ParsedPageConsumer
  constructor(domain:URL|string, 
    detector: Readable,
    parser: WebPageParser,
    consumer: FileConsumer,
    urlHandler: URLHandler) {
      super()
      if (!(domain instanceof URL)) {
        this.domain = str2url(domain)
      } else {
        this.domain = domain
      }
      if (!this.domain) {
        throw new Error("Invalid domain sent to Crawler constructor")
      }
      this.detector = detector
      this.consumer = consumer
      this.urlHandler = urlHandler
  }

  start() {
    this.detector.on("end", () => {
      console.log("Link detector ended", this.domain.href)
    })
    this.detector.on("data", (urlstring) => {
      const url: URL = new URL(urlstring)
      this.urlHandler.stream(url, (url, htmlstream) => {
        const parser = new MetaDataParser()
        htmlstream.pipe(parser).pipe(this.consumer, {end: false})
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
  }
}