#!/usr/bin/env node
const VERSION = "0.1.0"
const NAME = "Turbo Crawl"

const log = console.log
import chalk from "chalk"
import { fork, exec } from "child_process"
import Crawler from "../crawler/crawler";
const { str2url } = require("hittp")
import { request } from "http"
import { createWriteStream, readFileSync, unlink } from "fs"


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
    port: "49202"
  }
  log("Crawling with crawlerd at", `${options.host}:${options.port}`, url.href)
  const req = request(options, (res) => {
    res.on("data", (chunk) => {
      console.log("Client Received", res)
      req.end()
    })
  })
  req.on("connect", () => {
    console.log("Request Conneted")
  })
  req.on("error", (err) => {
    console.error(err)
  })
  req.write(url.href)
  req.end()
} else {
  const command = process.argv[2]
  if (command === "start") {
    const forked = fork("./src/cli/crawlerd/crawlerd.js", [process.argv[3] || "49202", process.argv[4] || "0.0.0.0"], {detached: true})
    let pids: any = []
    try {
      pids = readFileSync("./.turbocrawl/pid", {encoding: "utf-8"})
      pids = JSON.parse(pids)
    } catch (err) {
      pids = []
    }
    pids.push(forked.pid)
    log(chalk.blue(`The process id is ${forked.pid}`))
    const outfile = createWriteStream("./.turbocrawl/pid")
    outfile.write(JSON.stringify(pids), (err) => {
      if (err) log(chalk.red(err.message))
      else {
        outfile.close()
        process.exit()
      }
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
        process.exit()
      })
    }
  }
}