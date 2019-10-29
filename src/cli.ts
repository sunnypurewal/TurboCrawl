#!/usr/bin/env node

const VERSION = "0.1.0"
const NAME = "Turbo Crawl"
import { HOST, PORT } from "./env"
let port = PORT
let host = HOST.slice()
import chalk from "chalk"
import { accessSync, mkdirSync } from "fs"
import { str2url } from "hittp"
import log4js from "log4js"
import { exit, start } from "./cli/commands"
import crawl from "./cli/crawl"
import generate from "./cli/generate"
import { end, endall, pause, resume} from "./commands/crawl"
import { list } from "./commands/get"

const logger = log4js.getLogger()
logger.level = "debug"
const log = logger.debug

try {
  accessSync("./.turbocrawl/")
} catch (err) {
  mkdirSync("./.turbocrawl/crawled", {recursive: true})
}

if (process.argv[2] === undefined) {
  log(
    chalk.blue(`
  ${chalk.rgb(235, 213, 52).bold(`${NAME} ${VERSION}`)}

  You must supply a domain to be crawled:
    $ tcrawl www.mytotallyrealdomainname.com
    `),
  )
  process.exit(0)
}

const url = str2url(process.argv[2])
if (url) {
  crawl(port, host, [...process.argv.slice(), url.href])
} else {
  const command = process.argv[2]
  if (command === "start") {
    let arg = process.argv[3]
    if (arg) {
      const portnum = parseInt(arg)
      if (isNaN(portnum)) { throw new Error(`Invalid Port ${arg}`) } else { port = portnum }
    }
    arg = process.argv[4]
    if (arg) { host = arg }
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
      log(success ? chalk.greenBright("Turbo Crawl has exited") : chalk.redBright("Turbo Crawl failed to exit."))
    })
  } else if (command === "list") {
    list(port, host, (crawlerstrings) => {
      log(`
  Crawlers:
    ${crawlerstrings.length > 0 ? crawlerstrings.join("\n\t\t") : "None. You can use the following command to start a crawl:\n\ttcrawl www.someurlhere.com"}`)
    })
  } else if (command === "pause") {
    const arg = process.argv[3]
    const url = str2url(arg)
    if (url) {
      pause(port, host, url, (success) => {
        log((success ? chalk.greenBright("Turbo Crawl will pause") : chalk.redBright("Turbo Crawl failed to pause")), url.href)
      })
    }
  } else if (command === "end") {
    const arg = process.argv[3]
    const url = str2url(arg)
    if (url) {
      end(port, host, url, (success) => {
        log((success ?
          chalk.greenBright("Turbo Crawl will end")
          : chalk.redBright("Turbo Crawl failed to end")), url.href)
      })
    }
  } else if (command === "endall") {
    endall(port, host, (success) => {

    })
  } else if (command === "resume") {
    const arg = process.argv[3]
    const url = str2url(arg)
    if (url) {
      resume(port, host, url, (success) => {
        log((success ?
          chalk.greenBright("Turbo Crawl will resume")
          : chalk.redBright("Turbo Crawl failed to resume")), url.href)
      })
    }
  } else if (command === "generate") {
    generate(process.argv.slice())
  } else if (command === "crawl") {
    crawl(port, host, process.argv.slice())
  } else if (command === "watch") {
    const arg = process.argv[3]
    const url = str2url(arg)
    if (!url) { throw new Error(`Invalid URL ->${arg}<- passed as argument`) }

  }
}
