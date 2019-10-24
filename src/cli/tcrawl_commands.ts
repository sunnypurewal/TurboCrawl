import TurboCrawler from "./turbo_crawler"
import chalk from "chalk"
import { readFileSync, unlink } from "fs"
import { request } from "http"

function send(port: number, host: string, body: string) {
  const options: any = {
    host,
    port,
    headers: {"Content-Type": "application/json"},
    method: "POST"
  }
  const req = request(options)
  req.setHeader("Content-Type", "application/json")
  req.on("error", (err) => {
    console.error(err)
  })
  req.on("response", (res) => {
    res.on("data", (chunk) => {
    })
  })
  req.write(body)
  req.end()
}

export function crawl(port: number, host: string, url: URL) {
  send(port, host, url.href)
}

export function exit(port: number, host: string) {
  send(port, host, "exit")
}

export function start(port: number, host: string, callback: (turbo: TurboCrawler)=>void) {
  const turboCrawler = new TurboCrawler()
  turboCrawler.start(() => {
    if (callback) process.nextTick( () => callback(turboCrawler) )
  })
}

export function killall() {
  let pids: any = readFileSync("./.turbocrawl/pid", {encoding: "utf-8"})
  if (pids.length === 0) {
    console.log(chalk.green(`
Turbo Crawl is not running
`))
  } else {
    pids = JSON.parse(pids)
    console.log(chalk.red(`Killing ${pids.length} processes`))
    for (const pid of pids) {
      process.kill(pid)
    }
    unlink("./.turbocrawl/pid", (err) => {

    })
  }
}