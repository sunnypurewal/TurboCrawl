const hittp = require("hittp")
import { Readable } from "stream"

export interface IURLHandler {
  /**
   * Implement the handle method to fetch the contents of the URL
   * and return an HTML representation
   * @param {URL} url URL that needs to be handled
   * @param callback and return an  in this callback 
   */
  stream(url: URL, callback: (url: URL, htmlstream?: Readable, err?: Error)=>void): void
  cancel(host: string): void
}

export default class HTTPURLHandler implements IURLHandler {

  stream(url: URL, callback: (url: URL, htmlstream?: Readable, err?: Error)=>void) {
    hittp.stream(url).then((htmlstream: Readable) => {
      // process.nextTick(() => {
        callback(url, htmlstream)
      // })
    }).catch((err: Error) => {
      // console.error(err)
      // process.nextTick(() => {
        callback(url, undefined, err)
      // })
    })
  }

  cancel(host: string) {
    hittp.cancel(hittp.str2url(host))
  }
}