import stream from "stream"
const { SiteMapper } = require("getsitemap")
import LinkDetector from "../detector"
import GetSitemapTransformStream from "./transformer"

export default class SitemapLinkDetector implements LinkDetector {
  private transformer: GetSitemapTransformStream = new GetSitemapTransformStream()
  constructor() {
    this.transformer.on("end", () => {
      this.transformer.emit("")
    })
  }
  end(callback: () => void) {
    this.transformer.end(callback)
  }
  /**
   * 
   * @param domain The root domain of the website from which to extract links
   * @param options 
   */
  stream(domain: string | URL, options: any): Promise<stream.Readable> {
    return new Promise((resolve, reject) => {
      const mapper = new SiteMapper()
      mapper.map(domain, options.startDate).then((sitemapstream: stream.Readable) => {
        resolve(sitemapstream.pipe(this.transformer))
        this.transformer.on("end", () => {

        })
      })
    })
  }
}
