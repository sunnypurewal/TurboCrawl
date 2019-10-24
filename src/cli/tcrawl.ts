#!/usr/bin/env node
const VERSION = "0.1.0"
const NAME = "Turbo Crawl"
const DEFAULT_PORT = 8453
let port = DEFAULT_PORT
const log = console.log
import chalk from "chalk"
const { str2url } = require("hittp")
import { request, get } from "http"
import { createWriteStream, readFileSync, unlink } from "fs"
import TurboCrawler from "./turbo_crawler"

if (process.argv[2] === undefined) {
  log(
    chalk.blue(`
  ${chalk.rgb(235, 213, 52).bold(`${NAME} ${VERSION}`)}

  You must supply a domain to be crawled:
    $ tcrawl www.mytotallyrealdomainname.com
    `)
  )
  process.exit(0)
}

const url = str2url(process.argv[2])
if (url) {
  const options: any = {
    host: "localhost",
    port: 8453,
    headers: {"Content-Type": "application/json"},
    method: "POST"
  }
  const req = request(options)
  // req.setHeader("Content-Type", "application/json")
  req.on("error", (err) => {
    console.error(err)
  })
  req.on("response", (res) => {
    res.on("data", (chunk) => {
      console.log("Client received ", chunk.toString())
    })
  })
  req.write(url.href, (err) => {
    if (err) console.error(err)
    req.end()
  })
} else {
  const command = process.argv[2]
  if (command === "start") {
    const turboCrawler = new TurboCrawler()
    turboCrawler.start(() => {
      console.log(chalk.blue(`
      Turbo Crawl Daemon is now running
        Listening on port: ${turboCrawler.port}
        ${turboCrawler.host === "0.0.0.0" ? "and is accessible on your network" : "and is available locally"}
      `))
    })
  } else if (command === "killall") {
    let pids: any = readFileSync("./.turbocrawl/pid", {encoding: "utf-8"})
    if (pids.length === 0) {
      log(chalk.green(`
  Turbo Crawl is not running
  `))
    } else {
      pids = JSON.parse(pids)
      log(chalk.red(`Killing ${pids.length} processes`))
      for (const pid of pids) {
        process.kill(pid)
      }
      unlink("./.turbocrawl/pid", (err) => {
        // process.exit()
      })
    }
  }
}