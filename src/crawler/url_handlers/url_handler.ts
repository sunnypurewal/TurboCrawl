const hittp = require("hittp")
import { URLHandler, onURLHandledCallback, onHTMLStreamCallback } from "../interface"
import stream from "stream"


export default class HTTPURLHandler implements URLHandler {
  handle(url: URL, callback: onURLHandledCallback) {
    hittp.get(url).then((html: string|Buffer) => {
      process.nextTick(() => {
        callback({url, html})
      })
    })
  }

  stream(url: URL, callback: onHTMLStreamCallback) {
    hittp.stream(url).then((htmlstream: stream.Readable) => {
      // process.nextTick(() => {
        callback(url, htmlstream)
      // })
    }).catch((err: Error) => {
      console.error(err)
      // process.nextTick(() => {
        callback(url, undefined, err)
      // })
    })
  }

  cancel(host: string) {
    hittp.cancel(hittp.str2url(host))
  }
}