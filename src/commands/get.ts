import { request } from "http"

export function list(port: number, host: string, callback: (crawlers: any) => void ) {
  request({
    host,
    path: "/list",
    port,
  }, (res) => {
    let body: any = []
    res.on("error", (err) => {
      callback(null)
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
  }).on("error", (err) => {
    callback(false)
  }).end()
}

export function ping(port: number, host: string, callback: (success: boolean) => void ) {
  request({
    host,
    path: "/list",
    port,
  }, (res) => {
    let body: any = []
    res.on("error", (err) => {
      callback(false)
    }).on("data", (chunk) => {
      body.push(chunk)
    }).on("end", () => {
      body = Buffer.concat(body).toString()
      callback(res.statusCode! >= 200 && res.statusCode! <= 299)
    })
  }).on("error", (err) => {
    callback(false)
  }).end()
}
