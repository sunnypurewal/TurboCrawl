import stream from "stream"
const { str2url } = require("hittp")

export default class GetSitemapTransformStream extends stream.Transform {
  _transform(chunk: any, enc: any, cb: any) {
    let c = chunk
    if (typeof(c) !== "string") c = c.toString()
    c = c.split("||")
    let url = str2url(c[0])
    if (url instanceof URL) this.push(url.href)
    cb()
  }
}