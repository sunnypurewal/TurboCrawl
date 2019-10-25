#!/usr/bin/env node
const VERSION = "0.1.0"
const NAME = "Turbo Crawl"
const log = console.log
const DEFAULT_PORT = parseInt(process.env["PORT_TCRAWL"] || "8088")
let port = DEFAULT_PORT
const DEFAULT_HOST = process.env["HOST_TCRAWL"] || "localhost"
let host = DEFAULT_HOST
import chalk from "chalk"
const { str2url } = require("hittp")
import { start, crawl, exit, list } from "./tcrawl_commands"

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
  crawl(port, host, url, (success) => {
    log(success ? `${chalk.greenBright(url.href)} is being crawled` : `Failed to crawl ${chalk.redBright(url.href)}`)
  })
} else {
  const command = process.argv[2]
  if (command === "start") {
    let arg = process.argv[3]
    if (arg) {
      let portnum = parseInt(arg)
      if (isNaN(portnum)) throw new Error(`Invalid Port ${arg}`)
      else port = portnum
    }
    arg = process.argv[4]
    if (arg) host = arg
    start(port, host, (turbo) => {
      port = turbo.port
      host = turbo.host
      log(chalk.blue(`
  Turbo Crawl Daemon is now running
    Listening on port: ${port}
    ${host === "0.0.0.0" ? "and is accessible on your network" : "and is available locally"}
    `))
    })
  } else if (command === "exit") {
    exit(port, host, (success) => {
      log(success ? chalk.greenBright("Turbo Crawl will exit.") : chalk.redBright("Turbo Crawl failed to exit"))
    })
  } else if (command === "list") {
    list(port, host, (crawlerstrings) => {
      log(`
  Crawlers:    
    ${crawlerstrings.length > 0 ? crawlerstrings : "None. You can use the following command to start a crawl:\n\ttcrawl www.someurlhere.com"}`)
    })
  }
}