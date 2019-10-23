const hittp = require("hittp")
import { URLHandler, onURLHandledCallback, onHTMLStreamCallback } from "../interface"
import stream from "stream"


export default class HTTPURLHandler implements URLHandler {
  handle(url: URL, callback: onURLHandledCallback) {
    const urlcopy = new URL(url.href)
    hittp.get(urlcopy).then((html: string|Buffer) => {
      process.nextTick(() => {
        callback({url:urlcopy, html})
      })
    })
  }

  stream(url: URL, callback: onHTMLStreamCallback) {
    const urlcopy = new URL(url.href)
    hittp.stream(urlcopy).then((htmlstream: stream.Readable) => {
      process.nextTick(() => {
        callback(urlcopy, htmlstream)
      })         
    })
  }
}