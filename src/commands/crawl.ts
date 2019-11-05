import { accessSync, mkdirSync, readdirSync } from "fs"
import { request } from "http"
import { domainsFromFile } from "./helpers"
import { generate } from "./manage"

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
    generate(port, host, "reddit", ((body, err) => {
      const filenames = readdirSync(path).filter((d) => {
        return d !== undefined && d !== null && d !== path
      })
      _random(port, host, path, filenames, callback)
    }))
  } else {
    _random(port, host, path, filenames, callback)
  }
}

export default function crawl(port: number, host: string,
                              urls: URL[], callback?: (success: boolean, err?: Error) => void) {
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
