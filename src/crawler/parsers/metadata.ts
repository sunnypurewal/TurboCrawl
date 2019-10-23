import { WebPage, WebPageParser, onPageParsedCallback, onParserStreamCallback } from "../interface"
import {Readable, Transform, TransformCallback } from "stream"

//implement HTMLHandler
//then add it to crawler.htmlHandlers as default handler
//then call all handlers after urlhandler is called
/**
 * This is the default WebPageParser. 
 * Custom parsers should extend this class.
 */
export default class MetaDataParser implements WebPageParser {
  parse(page: WebPage, onPageParsed: onPageParsedCallback) {
    throw new Error(`${__filename} handle() Not Implemented`)
  }
  /**
   * Extracts metadata from the HTML and returns a stream of MetaData objects  
   * @param htmlstream A stream.Readable stream of valid HTML
   * @param callback Function that handles the stream.Readable result of parsing the HTML
   */
  stream(url: URL, htmlstream: Readable, callback: onParserStreamCallback) {
    callback(url, htmlstream.pipe(new MetadataStream()))
  }
}

class MetadataStream extends Transform {
  open: any
  lastChunk: any
  constructor(options?: any) {
    options = options || {}
    options.decodeStrings = false
    super(options)
    this.open = null
    this.lastChunk = null
  }

  _transform(chunk: any, encoding: string, callback: TransformCallback) { 
    let opens = chunk.matchAll(/<\s*meta/gi)
    this.open = opens.next()
    while (!this.open.done) {
      const openval = this.open.value
      // console.log(openval.input.slice(openval.index, openval.index+100))
      // break
      const closeindex = openval.input.indexOf(">", openval.index)
      let tag = openval.input.slice(openval.index, closeindex+1)
      let propertyIndex = tag.indexOf("property=\"")
      let contentIndex = tag.indexOf("content=\"")
      let property = tag.slice(propertyIndex+10, tag.indexOf("\"", propertyIndex+10))
      let content = tag.slice(contentIndex+9, tag.indexOf("\"", contentIndex+9))
      this.push(`${property}===${content}`)
      this.open = opens.next()
    }
    callback()
  }
}