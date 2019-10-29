import { PassThrough, Readable, Transform, TransformCallback, Writable } from "stream"
const { SiteMapper } = require("getsitemap")
const { str2url } = require("hittp")

export interface ILinkDetector extends Readable {
  domain: URL
  options?: any
}

export default class SitemapLinkDetector extends PassThrough implements ILinkDetector {
  public domain: URL
  public options?: any
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
  public _destroy(error: Error | null, callback: (error: Error | null) => void) {
    this.mapper.cancel()
    callback(error)
  }
}

class GetSitemapTransformStream extends Transform {
  public startDate: Date
  constructor(options?: any) {
    super(options)
    this.startDate = options.startDate
  }
  public _transform(chunk: any, encoding: string, callback: TransformCallback) {
    let c = chunk
    if (typeof(c) !== "string") { c = c.toString() }
    c = c.split("||")
    const url = str2url(c[0])
    if (url instanceof URL) { this.push(url.href) }
    callback()
  }
}
