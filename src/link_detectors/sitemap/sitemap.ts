import stream, { Transform } from "stream"
const { SiteMapper } = require("getsitemap")
import LinkDetector from "../detector"
import GetSitemapTransformStream from "./transformer"

export default class SitemapLinkDetector extends LinkDetector {
  static create(domain: URL | string, options: any): LinkDetector {
    const transformer = new GetSitemapTransformStream()
    const mapper = new SiteMapper()
    const sitemapstream: Transform = mapper.map(domain, options.startDate)
    return sitemapstream.pipe(transformer)
  }
}
