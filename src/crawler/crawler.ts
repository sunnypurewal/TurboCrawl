/**
 * The Crawler class is responsible for crawling a single website.
 * It takes a root domain as input (e.g. "reuters.com")
 * @remarks
 * The root domain is run through each {@link LinkDetector}
 * There is a single URLHandler that processes the
 * URL and emits a {@link WebPage | "url, html"} object
 */
import LinkDetector from "../link_detectors/detector";
import { WebPage, WebPageParser, ParsedPageConsumer, URLHandler } from "./interface";
import { Readable } from "stream";
import FileConsumer from "./consumers/file";
import { EventEmitter } from "events";
const { str2url } = require("hittp")

export default class Crawler extends EventEmitter {
  public domain:URL
  private detector: LinkDetector
  private urlHandler: URLHandler
  private parser: WebPageParser
  private consumer: ParsedPageConsumer
  constructor(domain:URL|string, 
    detector: LinkDetector,
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
      this.parser = parser
      this.consumer = consumer
      this.urlHandler = urlHandler
  }
  start() {
    this.detector.on("data", (urlstring) => {
      const url = new URL(urlstring)
      this.urlHandler.stream(url, (url, htmlstream: Readable) => {
        this.parser.stream(url, htmlstream, (url, parserstream) => {
          this.consumer.stream(url, parserstream, () => {
            
          })
        })
      })
    })
  }
  exit() {
    this.detector.destroy()
  }
}