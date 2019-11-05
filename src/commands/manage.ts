import { request } from "http"

export function pause(port: number, host: string, urls: URL[], callback?: (body: string|null, err?: Error) => void) {
  post(port, host, "/pause", JSON.stringify(urls.map((u) => u.href)), callback)
}
export function pauseall(port: number, host: string, callback?: (body: string|null, err?: Error) => void) {
  post(port, host, "/pauseall", null, callback)
}

export function end(port: number, host: string, urls: URL[], callback?: (body: string|null, err?: Error) => void) {
  post(port, host, "/end", JSON.stringify(urls.map((u) => u.href)), callback)
}
export function endall(port: number, host: string, callback?: (body: string|null, err?: Error) => void) {
  post(port, host, "/endall", null, callback)
}

export function resume(port: number, host: string, urls: URL[], callback?: (body: string|null, err?: Error) => void) {
  post(port, host, "/resume", JSON.stringify(urls.map((u) => u.href)), callback)
}
export function resumeall(port: number, host: string, callback?: (body: string|null, err?: Error) => void) {
  post(port, host, "/resumeall", null, callback)
}

// tslint:disable-next-line: max-line-length
export function generate(port: number, host: string, name: string, callback?: (body: string|null, err?: Error) => void) {
  post(port, host, "/generate", JSON.stringify({name}), callback)
}

export function exit(port: number, host: string) {
  const req = request({
    headers: {"content-type": "application/json"},
    host,
    path: "/exit",
    port,
  })
  req.end()
}

// tslint:disable-next-line: max-line-length
function post(port: number, host: string, path: string, jsonbody: string|null, callback?: (body: string|null, err?: Error) => void) {
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
      if (callback) {
        if (res.statusCode! >= 200 && res.statusCode! <= 299) {
          process.nextTick(() => callback(body))
        } else {
          process.nextTick(() => callback(null, new Error("HTTP Error" + res.statusCode)))
        }
      }
    })
  })
  req.write(jsonbody)
  req.end()
}
