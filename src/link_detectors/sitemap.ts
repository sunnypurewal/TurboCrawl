import { Transform, Readable, TransformCallback, Writable, PassThrough } from "stream"
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

export default class SitemapLinkDetector extends PassThrough {
  private stream: Readable|undefined
  private mapper: any
  constructor(domain: string, options: any) {
    super(options)
    const transformer = new GetSitemapTransformStream(options)
    this.mapper = new SiteMapper(domain)
    this.mapper.map(options.startDate).pipe(this).pipe(transformer)
  }
  cancel() {
    this.mapper.cancel()
  }
}
