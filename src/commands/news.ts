import { request } from "http";
import crawl from "./crawl"
import { domainsFromFile } from "./helpers"

function shuffle(array: any[]) {
  for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = array[i];
      array[i] = array[j];
      array[j] = temp;
  }
}

function _get(port: number, host: string, path: string, country: string, callback?: (success: boolean) => void) {
  const domains = domainsFromFile(`${path}/${country}`)
  shuffle(domains)
  crawl(port, host, domains, callback)
}

export default function crawlNational(port: number, host: string, country: string, callback?: (statusCode: number) => void) {
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
      if (callback) { callback(res.statusCode!) }
    })
  })
  req.write(JSON.stringify({ country }))
  req.end()
}
