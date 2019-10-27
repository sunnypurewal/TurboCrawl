/**
 * These are the commands that can be run from the tcrawl command line.
 */

import TurboCrawler from "../entry_points/server"
import { readFileSync, unlink, accessSync, mkdirSync, readdirSync } from "fs"
import { request } from "http"
const { str2url } = require("hittp")
const shuffle = require("knuth-shuffle").knuthShuffle
import GenerateReddit from "../scripts/redditpage"
import GenerateCountries from "../scripts/country"
import { join } from "path"

/**
 * Scrapes /r/politics for a list of domains that can be used for crawling
 * @param callback 
 */
export function genreddit(callback: (count: number) => void) {
  GenerateReddit(callback)
}

export function gencountries(callback: (count: number) => void) {
  GenerateCountries(callback)
}

function _country(port: number, host: string, path: string, country: string, callback?: () => void) {
  let domains = _domainsFromFile(`${path}/${country}`)
  shuffle(domains)
  bulkCrawl(port, host, domains)
}

export function country(port: number, host: string, country: string, callback?: () => void) {
  let path = "./.turbocrawl/default/countries"
  try {
    accessSync(path)
  } catch (err) {
    mkdirSync(path, {recursive: true})
  }

  let countriesjson = "./.turbocrawl/default/countries.json"
  try {
    accessSync(countriesjson)
  } catch (err) {
    GenerateCountries((count) => {
      _country(port, host, path, country, callback)
    })
    return
  }
  let filenames = readdirSync(path).filter((d) => {
    return d !== undefined && d !== null && d != path
  })
  if (filenames.length === 0) {
    GenerateCountries((count) => {
      _country(port, host, path, country, callback)
    })
  } else {
    _country(port, host, path, country, callback)
  }
}

function _domainsFromFile(path: string): URL[] {
  let domains: Buffer|string|any = readFileSync(path)
  domains = domains.toString().split("\n")
  domains = domains.filter((d: string) => d.length > 0)
  domains = domains.map((d: string) => str2url(d))
  return domains
}

function _random(port: number, host: string, path: string, filenames: string[], callback: (url?: URL) => void) {
  let random = Math.floor(Math.random() * filenames.length)
  let filename = filenames[random]
  let domains = _domainsFromFile(`${path}/${filename}`)
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
  } else {
    callback()
  }
}

export function random(port: number, host: string, callback: (url?: URL) => void) {
  let path = "./.turbocrawl/default/domains"
  try {
    accessSync(path)
  } catch (err) {
    mkdirSync(path, {recursive: true})
  }
  let filenames = readdirSync(path).filter((d) => {
    return d !== undefined && d !== null && d != path
  })
  if (filenames.length === 0) {
    GenerateReddit((count) => {
      let filenames = readdirSync(path).filter((d) => {
        return d !== undefined && d !== null && d != path
      })
      _random(port, host, path, filenames, callback)
    })
  } else {
    _random(port, host, path, filenames, callback)
  }
}
export function pause(port: number, host: string, url: URL, callback: (success: boolean, err?: Error) => void) {
  post(port, host, "/pause", url, callback)
}
export function end(port: number, host: string, url: URL, callback: (success: boolean, err?: Error) => void) {
  post(port, host, "/end", url, callback)
}
export function endall(port: number, host: string, callback: (success: boolean, err?: Error) => void) {
  post(port, host, "/endall", new URL("http://www.turobcrawl.com/"), callback)
}
export function resume(port: number, host: string, url: URL, callback: (success: boolean, err?: Error) => void) {
  post(port, host, "/resume", url, callback)
}

function post(port: number, host: string, path: string, url: URL, callback: (success: boolean, err?: Error) => void) {
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
        process.nextTick(() => callback(true))
      } else {
        process.nextTick(() => callback(false, new Error("HTTP Error" + res.statusCode)))
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
  console.log("Bulk crawling", urls.length, "domains")
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

export function crawl(port: number, host: string, url: URL, callback: (success: boolean, errCode?: number) => void) {
  const req = request({
    host,
    port,
    method: "POST",
    headers: {"content-type": "application/json"}
  }, (res) => {
    if (res.statusCode! >= 200 && res.statusCode! <= 299) {
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
    } else {
      process.nextTick(() => {
        callback(false, res.statusCode)
      })
    }
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