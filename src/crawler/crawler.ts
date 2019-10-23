import LinkDetector from "../link_detectors/detector";
import SitemapLinkDetector from "../link_detectors/sitemap/sitemap";
import URLHandler from "./url_handlers/url_handler";
import MetaDataParser from "./parsers/metadata";
import { WebPage, WebPageParser, ParsedPageConsumer } from "./interface";
import { Readable } from "stream";
import { createWriteStream } from "fs"
import FileConsumer from "./consumers/file";
const hittp = require("hittp")

export default class Crawler {
  private domain:URL
  private detectors: LinkDetector[]
  private urlHandler = new URLHandler()
  private parsers: WebPageParser[]
  private consumers: FileConsumer[]
  constructor(domain:URL|string, 
    detectors: LinkDetector[]=[new SitemapLinkDetector()],
    parsers: WebPageParser[]=[new MetaDataParser()],
    consumers: FileConsumer[]=[new FileConsumer()]) {
    if (!(domain instanceof URL)) {
      this.domain = hittp.str2url(domain)
    } else {
      this.domain = domain
    }
    if (!this.domain) {
      throw new Error("Invalid domain sent to Crawler constructor")
    }
    this.detectors = detectors.slice()
    this.parsers = parsers.slice()
    this.consumers = consumers.slice()
  }
  addDetector(d: LinkDetector) {
    this.detectors.push(d)
  }
  addParser(p: WebPageParser) {
    this.parsers.push(p)
  }
  addParsedPageConsumer(c: ParsedPageConsumer) {
    this.consumers.push(c)
  }
  start() {
    for (const detector of this.detectors) {
      detector.stream(this.domain, {startDate: "2019-10-20"}).then((urlstream) => {
        urlstream.on("data", (urlstring) => {
          const url = new URL(urlstring)
          this.urlHandler.stream(url, (url, htmlstream: Readable) => {
            for (const parser of this.parsers) {
              parser.stream(url, htmlstream, (url, parserstream) => {
                for (const consumer of this.consumers) {
                  consumer.stream(url, parserstream, () => {
                    console.log("Wrote something to file")
                  })
                }
              })
            }
          })
        })
      })
    }
  }
  pause() {

  }
  kill() {

  }
}