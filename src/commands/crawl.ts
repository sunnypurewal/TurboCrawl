import { request } from "http"

export function random(port: number, host: string, callback: (statusCode: number, response: any) => void) {
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
      if (callback) { callback(res.statusCode!, body) }
    })
  })
  req.write(JSON.stringify({ random: true }))
  req.end()
}

export default function crawl(port: number, host: string,
                              urls: URL[],
                              callback?: (statusCode: number, response: any) => void) {
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
      if (callback) {
        callback(res.statusCode!, body)
      }
    })
  })
  req.write(JSON.stringify(urls.map((u) => u.href)))
  req.end()
}
