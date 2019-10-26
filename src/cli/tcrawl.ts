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
import { start, crawl, bulkCrawl, exit, list, pause, end, resume, random, country, genreddit, gencountries, endall } from "./tcrawl_commands"
import { readFileSync, accessSync, mkdirSync } from "fs"

let COUNTRIES: string[] = []

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
      log(success ? chalk.greenBright("Turbo Crawl has exited") : chalk.redBright("Turbo Crawl failed to exit."))
    })
  } else if (command === "list") {
    list(port, host, (crawlerstrings) => {
      log(`
  Crawlers:    
    ${crawlerstrings.length > 0 ? crawlerstrings.join("\n\t\t") : "None. You can use the following command to start a crawl:\n\ttcrawl www.someurlhere.com"}`)
    })
  } else if (command === "pause") {
    let arg = process.argv[3]
    const url = str2url(arg)
    if (url) {
      pause(port, host, url, (success) => {
        log((success ? chalk.greenBright("Turbo Crawl will pause") : chalk.redBright("Turbo Crawl failed to pause")), url.href)
      })
    }
  } else if (command === "end") {
    let arg = process.argv[3]
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
    let arg = process.argv[3]
    const url = str2url(arg)
    if (url) {
      resume(port, host, url, (success) => {
        log((success ? 
          chalk.greenBright("Turbo Crawl will resume") 
          : chalk.redBright("Turbo Crawl failed to resume")), url.href)
      })
    }
  } else if (command === "generate") {
    let arg = process.argv[3]
    if (arg === "reddit") {
      log("Scraping", chalk.bold("/r/politics white list"), "for domain names")
      genreddit((count) => {
        log(count > 0 ? 
          chalk.greenBright(`Scraped ${count} domain names from /r/politics white list.`)
          : chalk.redBright("Failed to scrape anything from /r/politics white list"))
      })
    } else if (arg === "countries") {
      log("Scraping", chalk.bold("Wikipedia Category:News websites by country"), "for domain names")
      gencountries((count) => {
        log(count > 0 ? 
          chalk.greenBright(`Scraped ${count} domain names from Wikipedia Category: ${chalk.bold("News websites by country")}`)
          : chalk.redBright(`Failed to scrape anything from Wikipedia Category: ${chalk.bold("News websites by country")}`))
      })
    }
  }
  
  else if (command === "crawl") {
    let arg = process.argv[3]
    if (arg === "random") {
      random(port, host, (url) => {
        log((url ? chalk.greenBright(`Randomly selected ${url.href} for crawling`) : chalk.redBright("Turbo Crawl failed to random crawl")))
      })
    } else if (arg === "-f") {
      arg = process.argv[4]
      if (arg && arg.length > 0) {
        let domains: Buffer|string|any = readFileSync(arg)
        domains = domains.toString()
        domains = JSON.parse(domains)
        domains = domains.map((d: string) => { return str2url(d) }) as URL[]
        log(`Crawling ${chalk.greenBright(domains.length.toString())} domains`)
        bulkCrawl(port, host, domains)
      }
    } else {
      country(port, host, arg.toLowerCase(), () => {
        log(chalk.greenBright(`Turbo Crawl will crawl ${arg} news` ))
      })
    }
  }
}