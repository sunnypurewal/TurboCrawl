import { SiteMapper } from "getsitemap"
import { PassThrough, Readable } from "stream"

export default class IDetectorFactory {
  public create(domain: URL, options?: any): Readable {
    return new PassThrough()
  }
}

export class SitemapDetectorFactory implements IDetectorFactory {
  public create(domain: URL, options?: any): Readable {
    const mapper = new SiteMapper(domain.href)
    return mapper.map(options.startDate, {
      cachePath: "./.turbocrawl/cache",
      onlyURLs: true,
      readableObjectMode: true,
    })
  }
}
