import { accessSync, mkdirSync, readdirSync } from "fs"
import { str2url } from "hittp"
import { request } from "http"
import { domainsFromFile } from "./helpers"
import { generate } from "./manage"

export function random(port: number, host: string, callback: (statusCode: number, url?: URL) => void) {
  const req = request({
    headers: {"content-type": "application/json"},
    host,
    method: "POST",
    path: "/crawl",
    port,
  }, (res) => {
    let body: any = []
    res.on("error", (err) => {
      // console.error(err)
    }).on("data", (chunk) => {
      body.push(chunk)
    }).on("end", () => {
      body = Buffer.concat(body).toString()
      const contentType = res.headers["content-type"] || ""
      if (contentType === "application/json") {
        try {
          body = JSON.parse(body)
        } catch (err) {
          // console.error(err)
        }
      }
      if (callback) { callback(res.statusCode!, str2url(body.url)) }
    })
  })
  req.write(JSON.stringify({ random: true }))
  req.end()
}

export default function crawl(port: number, host: string,
                              urls: URL[], callback?: (success: boolean, err?: Error) => void) {
  const req = request({
    headers: {"content-type": "application/json"},
    host,
    method: "POST",
    port,
  }, (res) => {
    let body: any = []
    res.on("error", (err) => {
      // console.error(err)
    }).on("data", (chunk) => {
      body.push(chunk)
    }).on("end", () => {
      body = Buffer.concat(body).toString()
      const contentType = res.headers["content-type"] || ""
      if (contentType === "application/json") {
        try {
          body = JSON.parse(body)
        } catch (err) {
          // console.error(err)
        }
      }
      if (callback) { callback(res.statusCode! >= 200 && res.statusCode! <= 299) }
    })
  })
  req.write(JSON.stringify(urls.map((u) => u.href)))
  req.end()
}
