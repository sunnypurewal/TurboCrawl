import LinkDetector from "../link_detectors/detector";
import SitemapLinkDetector from "../link_detectors/sitemap/sitemap";
import URLHandler from "./urlhandler";
const hittp = require("hittp")

export default class Crawler {
  private domain:URL
  private detectors: LinkDetector[]
  private urlHandlers = [new URLHandler()]
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
  addURLHandler(u: URLHandler) {
    this.urlHandlers.push(u)
  }
  start() {
    for (const detector of this.detectors) {
      detector.stream(this.domain, {startDate: ""}).then((urlstream) => {
        urlstream.on("data", (urlstring) => {
          this.urlHandler.handle(new URL(urlstring), (url: URL, html: string|Buffer) => {
            console.log("Handled", url.href, html.length)
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