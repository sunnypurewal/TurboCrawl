import { Transform, Readable, TransformCallback } from "stream"
const { SiteMapper } = require("getsitemap")
const { str2url } = require("hittp")

class GetSitemapTransformStream extends Transform {
  startDate: Date
  constructor(options?: any) {
    super(options)
    this.startDate = options.startDate
  }
  _transform(chunk: any, encoding: string, callback: TransformCallback) {
    let c = chunk
    if (typeof(c) !== "string") c = c.toString()
    c = c.split("||")
    let url = str2url(c[0])
    if (url instanceof URL) this.push(url.href)
    callback()
  }
}

export default class SitemapLinkDetector {
  static create(domain: URL | string, options: any): Readable {
    const transformer = new GetSitemapTransformStream(options)
    const mapper = new SiteMapper()
    const sitemapstream: Readable = mapper.map(domain, options.startDate)
    return sitemapstream.pipe(transformer)
  }
}
