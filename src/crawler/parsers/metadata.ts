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
  constructor(options?: any) {
    options = options || {}
    options.decodeStrings = false
    super(options)
    this.open = null
    this.lastChunk = null
  }

  _transform(c: any, encoding: string, callback: TransformCallback) {
    let chunk = c.toString()
    let opens = chunk.matchAll(/<\s*meta/gi)
    this.open = opens.next()
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
        this.push(JSON.stringify({property, content}))
      } else {
        let nameIndex = tag.indexOf("name=\"")
        if (nameIndex !== -1) {
          let name = tag.slice(nameIndex+6, tag.indexOf("\"", nameIndex+6))
          this.push(JSON.stringify({name, content}))
        }
      }
      this.open = opens.next()
    }
    callback()
  }
}