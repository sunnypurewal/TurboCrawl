import TurboCrawler from "./turbo_crawler"
import chalk from "chalk"
import { readFileSync, unlink } from "fs"
import { request } from "http"
const { str2url } = require("hittp")
import Crawler from "../crawler/crawler"

export function random(port: number, host: string, callback: (url?: URL) => void) {
  let domains: Buffer|string|any = readFileSync("./.turbocrawl/default/domains.json")
  domains = domains.toString()
  try {
    domains = JSON.parse(domains)
  } catch (err) {
    callback()
    return
  }
  if (domains && domains.length > 0) {
    let random = Math.floor(Math.random() * domains.length)
    let domain = domains[random]
    let url = str2url(domain)
    if (url) {
      crawl(port, host, url, (success) => {
        callback(success ? url : undefined)
      })
    } else {
      callback()
    }
  }
}
export function pause(port: number, host: string, url: URL, callback: (success: boolean) => void) {
  post(port, host, "/pause", url, callback)
}
export function end(port: number, host: string, url: URL, callback: (success: boolean) => void) {
  post(port, host, "/end", url, callback)
}
export function resume(port: number, host: string, url: URL, callback: (success: boolean) => void) {
  post(port, host, "/resume", url, callback)
}

function post(port: number, host: string, path: string, url: URL, callback: (success: boolean) => void) {
  const req = request({
    host,
    port,
    path,
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
      if (res.statusCode! >= 200 && res.statusCode! <= 299) {
        const contentType = res.headers["content-type"] || ""
        if (contentType === "application/json") {
          try {
            body = JSON.parse(body)
            process.nextTick(() => {callback(body.success)})
          } catch (err) {
            console.error(err)
          }
        }
      } else {
        console.error("HTTP ERROR", res.statusCode)
      }
    })
  })
  req.write(JSON.stringify({url: url.href}))
  req.end()
}

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

export function bulkCrawl(port: number, host: string, urls: URL[], callback?: (success: boolean, url: URL)=>void) {
  const req = request({
    host,
    port,
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
        } catch (err) {
          console.error(err)
        }
      }
    })
  })
  req.write(JSON.stringify(urls.map(u => u.href)))
  req.end()
}

export function crawl(port: number, host: string, url: URL, callback: (success: boolean) => void) {
  const req = request({
    host,
    port,
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