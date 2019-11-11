import { SiteMapper } from "getsitemap"
import { str2url } from "hittp"
import { PassThrough, Readable, Transform, TransformCallback, Writable } from "stream"

export interface ILinkDetector extends Readable {
  domain: URL
  options?: any
  getLinkCount(): number
}

export default class SitemapLinkDetector extends PassThrough implements ILinkDetector {
  public domain: URL
  public options?: any
  private mapper: any
  private transformer: GetSitemapTransformStream
  constructor(domain: URL, options?: any) {
    options = options || {}
    super(options)
    this.transformer = new GetSitemapTransformStream(options)
    this.domain = domain
    this.options = options
    this.mapper = new SiteMapper(domain.href)
    const sitemapstream = this.mapper.map(options.startDate, { cachePath: "./.turbocrawl/cache" })
    sitemapstream.pipe(this).pipe(this.transformer)
  }

  public _destroy(error: Error | null, callback: (error: Error | null) => void) {
    this.mapper.cancel()
    callback(error)
  }

  public getLinkCount() {
    return this.transformer.count
  }
}

class GetSitemapTransformStream extends Transform {
  public startDate: Date
  public count: number = 0
  constructor(options?: any) {
    super(options)
    this.startDate = options.startDate
  }
  public _transform(chunk: any, encoding: string, callback: TransformCallback) {
    let c = chunk
    if (typeof(c) !== "string") { c = c.toString() }
    c = c.split("||")
    const url = str2url(c[0])
    if (url instanceof URL) {
      this.count += 1
      this.push(url.href)
    }
    callback()
  }
}
