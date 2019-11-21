import { SiteMapper } from "getsitemap"
import { str2url } from "hittp"
import { PassThrough, Readable, Transform, TransformCallback } from "stream"

export default class ILinkDetector extends PassThrough {
  domain: URL
  options?: any
  constructor(domain: URL, options?: any) {
    super(options)
    this.domain = domain
    this.options = options
  }
  getLinkCount(): number {
    return 0
  }
}

export class SitemapLinkDetector extends ILinkDetector {
  private mapper: any
  private transformer: GetSitemapTransformStream
  constructor(domain: URL, options?: any) {
    options = options || {}
    super(domain, options)
    this.transformer = new GetSitemapTransformStream(options)
    this.mapper = new SiteMapper(domain.href)
    console.log(options.startDate)
    const sitemapstream = this.mapper.map(options.startDate, { cachePath: "./.turbocrawl/cache" })
    sitemapstream.pipe(this.transformer).pipe(this)
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
