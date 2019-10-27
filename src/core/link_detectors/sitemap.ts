import { Transform, Readable, TransformCallback, Writable, PassThrough } from "stream"
const { SiteMapper } = require("getsitemap")
const { str2url } = require("hittp")
import { LinkDetector } from "../../interface"

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

export default class SitemapLinkDetector extends PassThrough implements LinkDetector {
  domain: URL
  options?: any
  private mapper: any
  constructor(domain: URL, options?: any) {
    options = options || {}
    super(options)
    const transformer = new GetSitemapTransformStream(options)
    this.domain = domain
    this.options = options
    this.mapper = new SiteMapper(domain.href)
    this.mapper.map(options.startDate).pipe(this).pipe(transformer)
  }
  _destroy(error: Error | null, callback: (error: Error | null) => void) {
    this.mapper.cancel()
    callback(error)
  }
}
