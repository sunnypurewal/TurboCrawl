import stream, { TransformCallback } from "stream"
const { str2url } = require("hittp")

export default class GetSitemapTransformStream extends stream.Transform {
  lastParent: URL|null = null
  _transform(chunk: any, encoding: string, callback: TransformCallback) {
    let c = chunk
    if (typeof(c) !== "string") c = c.toString()
    c = c.split("||")
    let url = str2url(c[0])
    if (url instanceof URL) this.push(url.href)
    this.lastParent = str2url(c[2])
  }
}