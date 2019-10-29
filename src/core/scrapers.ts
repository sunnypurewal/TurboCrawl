import { Transform, TransformCallback } from "stream"

/**
 * Scrapers must implement this one method that returns a transform stream.
 * create() will be called on each url handled
 * and the html will stream to the Transform stream returned from create().
 * See MetadataScraper for a default implementation
 */
export interface IScraper {
  create(options?: any): Transform
}

export default class MetadataScraper implements IScraper {
  public create(options?: any): MetadataScrapeStream {
    return new MetadataScrapeStream(options)
  }
}

class MetadataScrapeStream extends Transform {
  public open: any
  public lastChunk: any
  public chunks: Buffer[]
  constructor(options?: any) {
    options = options || {}
    options.decodeStrings = false
    super(options)
    this.open = null
    this.lastChunk = null
    this.chunks = []
  }

  public _transform(c: any, encoding: string, callback: TransformCallback) {
    this.chunks.push(c)
    callback()
  }

  public _flush(callback: TransformCallback) {
    const body: any = Buffer.concat(this.chunks).toString()
    const opens = body.matchAll(/<\s*meta/gi)
    this.open = opens.next()
    const metadata: any = {}
    while (!this.open.done) {
      const openval = this.open.value
      // console.log(openval.input.slice(openval.index, openval.index+100))
      // break
      const closeindex = openval.input.indexOf(">", openval.index)
      const tag: string = openval.input.slice(openval.index, closeindex + 1)
      const contentIndex = tag.indexOf("content=\"")
      const content = tag.slice(contentIndex + 9, tag.indexOf("\"", contentIndex + 9))
      const propertyIndex = tag.indexOf("property=\"")
      if (propertyIndex !== -1) {
        const property = tag.slice(propertyIndex + 10, tag.indexOf("\"", propertyIndex + 10))
        if (property.indexOf("og:") !== -1 || property.indexOf("twitter:") !== -1) {
          metadata[property] = content
          // this.push(JSON.stringify({property, content}) + "\n")
        }
      } else {
        const nameIndex = tag.indexOf("name=\"")
        if (nameIndex !== -1) {
          const name = tag.slice(nameIndex + 6, tag.indexOf("\"", nameIndex + 6))
          metadata[name] = content
          // this.push(JSON.stringify({name, content}) + "\n")
        }
      }
      this.open = opens.next()
    }
    try {
      this.push(JSON.stringify(metadata) + "\n")
    } catch (err) {}
    callback()
  }

}
