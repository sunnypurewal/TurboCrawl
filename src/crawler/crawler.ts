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
import SitemapLinkDetector from "../link_detectors/sitemap";
import HTTPURLHandler from "./url_handlers/url_handler";
const hittp = require("hittp")

hittp.configure({cachePath: "./.cache"})
export default class Crawler extends EventEmitter {
  public domain:URL
  private detector: SitemapLinkDetector
  private consumer: ParsedPageConsumer
  private urlHandler: URLHandler
  constructor(domain:string, consumer: FileConsumer,
    ) {
      super()
      this.domain = hittp.str2url(domain)
      if (!this.domain) {
        throw new Error("Invalid domain sent to Crawler constructor")
      }
      this.detector = new SitemapLinkDetector(this.domain.host, {startDate: "2019-10-21"})
      this.consumer = consumer
      this.urlHandler = new HTTPURLHandler()
  }

  start() {
    // this.detector.on("end", () => {
    //   console.log("Link detector ended", this.domain.href)
    // })
    // this.detector.on("close", () => {
    //   console.log("Link detector closed", this.domain.href)
    // })
    this.detector.on("data", (chunk) => {
      let chunkstring = chunk.toString()
      const url: URL = hittp.str2url(chunkstring.split("||")[0])
      this.urlHandler.stream(url, (url, htmlstream, err) => {
        if (htmlstream) {
          const parser = new MetaDataParser()
          htmlstream.pipe(parser).pipe(this.consumer, {end: false})
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
    this.detector.cancel()
    this.detector.destroy()
    this.consumer.destroy()
    this.emit("exit")
  }
}