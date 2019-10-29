import { request } from "http"

export function pause(port: number, host: string, urls: URL[], callback: (success: boolean, err?: Error) => void) {
  posturls(port, host, "/pause", urls, callback)
}
export function pauseall(port: number, host: string, callback: (success: boolean, err?: Error) => void) {
  post(port, host, "/pauseall", callback)
}

export function end(port: number, host: string, urls: URL[], callback: (success: boolean, err?: Error) => void) {
  posturls(port, host, "/end", urls, callback)
}
export function endall(port: number, host: string, callback: (success: boolean, err?: Error) => void) {
  post(port, host, "/endall", callback)
}

export function resume(port: number, host: string, urls: URL[], callback: (success: boolean, err?: Error) => void) {
  posturls(port, host, "/resume", urls, callback)
}
export function resumeall(port: number, host: string, callback: (success: boolean, err?: Error) => void) {
  post(port, host, "/resumeall", callback)
}

export function exit(port: number, host: string, callback: (success: boolean, err?: Error) => void) {
  post(port, host, "/exit", callback)
}

function post(port: number, host: string, path: string, callback: (success: boolean, err?: Error) => void) {
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
  req.end()
}

function posturls(port: number, host: string, path: string,
                  urls: URL[], callback: (success: boolean, err?: Error) => void) {
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
  req.write(JSON.stringify(urls.map((u) => u.href)))
  req.end()
}
