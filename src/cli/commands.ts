/**
 * These are the commands that can be run from the tcrawl command line.
 */

import TurboCrawler from "../server"
import { request } from "http"

export function exit(port: number, host: string, callback: (success: boolean)=>void) {
  request({
    host,
    port,
    path: "/exit"
  }, (res) => {
    let body: any = []
    res.on("error", (err) => {
      console.error(err)
    }).on("data", (chunk) => {
      body.push(chunk)
    }).on("end", () => {
      callback(res.statusCode! >= 200 && res.statusCode! <= 299)
    })
  }).end()
}

export function start(port: number, host: string, callback: (turbo: TurboCrawler)=>void) {
  const turboCrawler = new TurboCrawler()
  turboCrawler.start(() => {
    if (callback) process.nextTick( () => callback(turboCrawler) )
  })
}