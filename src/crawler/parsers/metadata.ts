import {Transform, TransformCallback } from "stream"

//implement HTMLHandler
//then add it to crawler.htmlHandlers as default handler
//then call all handlers after urlhandler is called
/**
 * This is the default WebPageParser. 
 * Custom parsers should extend this class.
 */
export default class MetadataParser extends Transform {
  open: any
  lastChunk: any
  chunks: Buffer[]
  constructor(options?: any) {
    options = options || {}
    options.decodeStrings = false
    super(options)
    this.open = null
    this.lastChunk = null
    this.chunks = []
  }

  _transform(c: any, encoding: string, callback: TransformCallback) {
    this.chunks.push(c)
    callback()
  }

  _flush(callback: TransformCallback) {
    let body: any = Buffer.concat(this.chunks).toString()
    let opens = body.matchAll(/<\s*meta/gi)
    this.open = opens.next()
    let metadata: any = {}
    while (!this.open.done) {
      const openval = this.open.value
      // console.log(openval.input.slice(openval.index, openval.index+100))
      // break
      const closeindex = openval.input.indexOf(">", openval.index)
      let tag: string = openval.input.slice(openval.index, closeindex+1)
      let contentIndex = tag.indexOf("content=\"")
      let content = tag.slice(contentIndex+9, tag.indexOf("\"", contentIndex+9))
      let propertyIndex = tag.indexOf("property=\"")
      if (propertyIndex !== -1) {
        let property = tag.slice(propertyIndex+10, tag.indexOf("\"", propertyIndex+10))
        if (property.indexOf("og:") !== -1 || property.indexOf("twitter:") !== -1) {
          metadata[property] = content
          // this.push(JSON.stringify({property, content}) + "\n")
        }
      } else {
        let nameIndex = tag.indexOf("name=\"")
        if (nameIndex !== -1) {
          let name = tag.slice(nameIndex+6, tag.indexOf("\"", nameIndex+6))
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