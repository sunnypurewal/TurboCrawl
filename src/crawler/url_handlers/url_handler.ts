const hittp = require("hittp")
import { URLHandler, onURLHandledCallback, onHTMLStreamCallback } from "../interface"
import stream from "stream"


export default class HTTPURLHandler implements URLHandler {
  private domain: URL
  constructor(domain: URL) {
    this.domain = new URL(domain.href)
  }
  handle(callback: onURLHandledCallback) {
    hittp.get(this.domain).then((html: string|Buffer) => {
      process.nextTick(() => {
        callback({url:this.domain, html})
      })
    })
  }

  stream(callback: onHTMLStreamCallback) {
    hittp.stream(this.domain).then((htmlstream: stream.Readable) => {
      process.nextTick(() => {
        callback(this.domain, htmlstream)
      })
    }).catch((err: Error) => {
      console.error(err)
    })
  }

  cancel(host: string) {
    hittp.cancel(hittp.str2url(host))
  }
}