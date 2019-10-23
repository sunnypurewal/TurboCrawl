#!/usr/bin/env node
const VERSION = "0.1.0"
const NAME = "Turbo Crawl"

const log = console.log
import chalk from "chalk"
import { fork, exec } from "child_process"
import Crawler from "../crawler/crawler";
const { str2url } = require("hittp")
import { request } from "http"


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
  log("Crawling", url.href)
  const options: any = {}
  options.host = "localhost"
  options.port = "49202"
  const req = request(options, (res) => {
    res.on("data", (chunk) => {
      console.log("Client Received", res)
    })
  })
  req.write(url.href)
  req.end()
} else {
  const command = process.argv[2]
  if (command === "start") {

    // exec("node ./src/cli/crawlerd/crawlerd.js", (err, stdout, stderr) => {
    //   if (err) console.error(err)
    //   console.log(stdout)
    //   console.log(stderr)
    // })
    fork("./src/cli/crawlerd/crawlerd.js", [process.argv[3] || "49202", process.argv[4] || "0.0.0.0"], {detached: true})
    process.exit()
  }
}