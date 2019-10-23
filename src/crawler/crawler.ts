import LinkDetector from "../link_detectors/detector";
import SitemapLinkDetector from "../link_detectors/sitemap/sitemap";
import URLHandler from "./urlhandler";
import HTMLHandler from "./htmlhandler";
const hittp = require("hittp")

export default class Crawler {
  private domain:URL
  private detectors: LinkDetector[]
  private urlHandler = new URLHandler()
  private htmlHandlers = [new HTMLHandler]
  constructor(domain:URL|string, detectors:LinkDetector[]=[new SitemapLinkDetector()]) {
    if (!(domain instanceof URL)) {
      this.domain = hittp.str2url(domain)
    } else {
      this.domain = domain
    }
    if (!this.domain) {
      throw new Error("Invalid domain sent to Crawler constructor")
    }
    this.detectors = detectors.slice()
  }
  addDetector(d: LinkDetector) {
    this.detectors.push(d)
  }
  addHTMLHandler(h: HTMLHandler) {
    this.htmlHandlers.push(h)
  }
  start() {
    for (const detector of this.detectors) {
      detector.stream(this.domain, {startDate: ""}).then((urlstream) => {
        urlstream.on("data", (urlstring) => {
          const url = new URL(urlstring)
          this.urlHandler.handle(url, (html: string|Buffer) => {
            for (const handler of this.htmlHandlers) {
              handler.handle(url, (result) => {

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