import { accessSync, mkdirSync, readdirSync } from "fs"
import { request } from "http"
import { genreddit } from "./generate"
import { domainsFromFile } from "./helpers"

function _random(port: number, host: string, path: string, filenames: string[], callback: (url?: URL) => void) {
  const random = Math.floor(Math.random() * filenames.length)
  const filename = filenames[random]
  const domains = domainsFromFile(`${path}/${filename}`)
  if (domains && domains.length > 0) {
    const random = Math.floor(Math.random() * domains.length)
    const domain = new URL(domains[random].href)
    crawl(port, host, [domain], (success) => {
      callback(success ? domain : undefined)
    })
  } else {
    callback()
  }
}

export function random(port: number, host: string, callback: (url?: URL) => void) {
  const path = "./.turbocrawl/default/domains"
  try {
    accessSync(path)
  } catch (err) {
    mkdirSync(path, {recursive: true})
  }
  const filenames = readdirSync(path).filter((d) => {
    return d !== undefined && d !== null && d !== path
  })
  if (filenames.length === 0) {
    genreddit((_) => {
      const filenames = readdirSync(path).filter((d) => {
        return d !== undefined && d !== null && d !== path
      })
      _random(port, host, path, filenames, callback)
    })
  } else {
    _random(port, host, path, filenames, callback)
  }
}

export default function crawl(port: number, host: string, urls: URL[], callback?: (success: boolean) => void) {
  console.log("Bulk crawling", urls.length, "domains")
  const req = request({
    headers: {"content-type": "application/json"},
    host,
    method: "POST",
    port,
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
      if (callback) { callback(res.statusCode! >= 200 && res.statusCode! <= 299) }
    })
  })
  req.write(JSON.stringify(urls.map((u) => u.href)))
  req.end()
}

export function pause(port: number, host: string, url: URL, callback: (success: boolean, err?: Error) => void) {
  posturl(port, host, "/pause", url, callback)
}
export function pauseall(port: number, host: string, url: URL, callback: (success: boolean, err?: Error) => void) {
  posturl(port, host, "/pauseall", url, callback)
}
export function end(port: number, host: string, url: URL, callback: (success: boolean, err?: Error) => void) {
  posturl(port, host, "/end", url, callback)
}
export function endall(port: number, host: string, callback: (success: boolean, err?: Error) => void) {
  posturl(port, host, "/endall", new URL("http://www.turbocrawl.com/"), callback)
}
export function resume(port: number, host: string, url: URL, callback: (success: boolean, err?: Error) => void) {
  posturl(port, host, "/resume", url, callback)
}
export function resumeall(port: number, host: string, url: URL, callback: (success: boolean, err?: Error) => void) {
  posturl(port, host, "/resumeall", url, callback)
}

function posturl(port: number, host: string, path: string,
                 url: URL, callback: (success: boolean, err?: Error) => void) {
  const req = request({
    headers: {"content-type": "application/json"},
    host,
    method: "POST",
    path,
    port,
  }, (res) => {
    let body: any = []
    res.on("error", (err) => {
      console.error(err)
    }).on("data", (chunk) => {
      body.push(chunk)
    }).on("end", () => {
      body = Buffer.concat(body).toString()
      if (res.statusCode! >= 200 && res.statusCode! <= 299) {
        process.nextTick(() => callback(true))
      } else {
        process.nextTick(() => callback(false, new Error("HTTP Error" + res.statusCode)))
      }
    })
  })
  req.write(JSON.stringify({url: url.href}))
  req.end()
}
