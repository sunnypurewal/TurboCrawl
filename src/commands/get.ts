import { request } from "http"

export function list(port: number, host: string, callback: (crawlers: any) => void ) {
  request({
    host,
    path: "/list",
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
          process.nextTick(() => {callback(body.crawlerstrings)})
        } catch (err) {
          throw err
        }
      }
    })
  }).end()
}
