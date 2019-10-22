import stream from "stream"
const { SiteMapper } = require("getsitemap")
import LinkDetector from "../detector"
import GetSitemapTransformStream from "./transformer"

export default class SitemapLinkDetector implements LinkDetector {
  stream(url: string | URL, options: any): Promise<stream.Readable> {
    return new Promise((resolve, reject) => {
      const mapper = new SiteMapper()
      mapper.map(url, options.startDate).then((sitemapstream: stream.Readable) => {
        const transformer = new GetSitemapTransformStream()
        resolve(sitemapstream.pipe(transformer))
      })
    })
  }
}

