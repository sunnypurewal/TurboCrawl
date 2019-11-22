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
    const startDate = new Date(Date.now() - (1000 * 60 * 60 * 24 * 2)) // 2 days ago
    return mapper.map(startDate, Object.assign(options, {
      cachePath: "./.turbocrawl/cache"
    }))
  }
}
