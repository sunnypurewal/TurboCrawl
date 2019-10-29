/**
 * These are the commands that can be run from the tcrawl command line.
 */

import { request } from "http"
import TurboCrawler from "../server"

export function exit(port: number, host: string, callback: (success: boolean) => void) {
  request({
    host,
    path: "/exit",
    port,
  }, (res) => {
    const body: any = []
    res.on("error", (err) => {
      // console.error(err)
    }).on("data", (chunk) => {
      body.push(chunk)
    }).on("end", () => {
      callback(res.statusCode! >= 200 && res.statusCode! <= 299)
    })
  }).end()
}

export function start(port: number, host: string, callback: (turbo: TurboCrawler) => void) {
  const turboCrawler = new TurboCrawler()
  turboCrawler.listen(() => {
    if (callback) { process.nextTick( () => callback(turboCrawler) ) }
  })
}
