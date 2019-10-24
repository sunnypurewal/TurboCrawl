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
  private consumer: FileConsumer
  private _ABORT: boolean = false
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
    this.detector.stream(this.domain, {startDate: "2019-10-20"}).then((urlstream) => {
      urlstream.on("data", (urlstring) => {
        if (this._ABORT) {
          this.detector.end(() => {
            this.emit("exit")
          })
        }
        const url = new URL(urlstring)
        this.urlHandler.stream(url, (url, htmlstream: Readable) => {
          this.parser.stream(url, htmlstream, (url, parserstream) => {
            this.consumer.stream(url, parserstream, () => {
              // Done the pipeline
            })
          })
        })
      })
    })
  }
  exit() {
    this._ABORT = true
  }
}