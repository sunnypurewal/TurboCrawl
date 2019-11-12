import { request } from "http";

// tslint:disable-next-line: max-line-length
export default function crawlNational(port: number, host: string, country: string, callback?: (statusCode: number, response: any) => void) {
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
  req.write(JSON.stringify({ country }))
  req.end()
}
