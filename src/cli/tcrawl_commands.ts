import TurboCrawler from "./turbo_crawler"
import chalk from "chalk"
import { readFileSync, unlink } from "fs"
import { request } from "http"
import Crawler from "../crawler/crawler"

export function list(port: number, host: string, callback: (crawlerstrings: string[]) => void ) {
  request({
    host,
    port,
    path: "/list"
  }, (res) => {
    let body: any = []
    res.on("error", (err) => {
      console.error(err)
    }).on("data", (chunk) => {
      body.push(chunk)
    }).on("end", () => {
      body = Buffer.concat(body).toString()
      const contentType = res.headers["content-type"] || ""
      if (contentType === "application/json") {
        try {
          body = JSON.parse(body)
          process.nextTick(() => {callback(body.crawlerstrings)})
        } catch (err) {
          throw err
        }
      }
    })
  }).end()
}

export function crawl(port: number, host: string, url: URL, callback: (success: boolean) => void) {
  const req = request({
    host,
    port,
    path: "/crawl",
    method: "POST",
    headers: {"content-type": "application/json"}
  }, (res) => {
    let body: any = []
    res.on("error", (err) => {
      console.error(err)
    }).on("data", (chunk) => {
      body.push(chunk)
    }).on("end", () => {
      body = Buffer.concat(body).toString()
      const contentType = res.headers["content-type"] || ""
      if (contentType === "application/json") {
        try {
          body = JSON.parse(body)
          process.nextTick(() => {callback(body.success)})
        } catch (err) {
          console.error(err)
        }
      }
    })
  })
  req.write(JSON.stringify({url: url.href}))
  req.end()
}

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
      body = Buffer.concat(body).toString()
      const contentType = res.headers["content-type"] || ""
      if (contentType === "application/json") {
        try {
          body = JSON.parse(body)
          process.nextTick(() => {callback(body.success)})
        } catch (err) {
          throw err
        }
      }
    })
  }).end()
}

export function start(port: number, host: string, callback: (turbo: TurboCrawler)=>void) {
  const turboCrawler = new TurboCrawler()
  turboCrawler.start(() => {
    if (callback) process.nextTick( () => callback(turboCrawler) )
  })
}