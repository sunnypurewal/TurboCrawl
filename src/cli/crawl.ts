import chalk from "chalk"
import { readFileSync } from "fs"
import { str2url } from "hittp"
import log4js from "log4js"
import { country } from "../commands/country"
import { bulkCrawl, crawl as _crawl, random } from "../commands/crawl"

const logger = log4js.getLogger()
logger.level = "debug"
const log = logger.debug

export default function crawl(port: number, host: string, args: string[]) {
  let arg = args[3]
  if (!arg || arg.length === 0) {
    log(chalk.blueBright("\nThe crawl command:")
    + "\nSubmits a crawler to the server for execution"
    + "\n  tcrawl crawl www.replacethiswitharealwebsite.com\n    Begins crawling the website sent in as an argument. See server for logs."
    + "\n  tcrawl crawl random\n    Crawls a random news website."
    + "\n  tcrawl crawl american\n    Crawls popular American news websites. Link to full list of countries: https://en.wikipedia.org/wiki/Category:News_websites_by_country"
    + "\n  tcrawl crawl -f filename\n    Pass in a newline-delimited file of URLs to crawl.\n    That means one URL per line.")
    return
  }
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
      domains = domains.map((d: string) => str2url(d)) as URL[]
      log(`Crawling ${chalk.greenBright(domains.length.toString())} domains`)
      bulkCrawl(port, host, domains)
    } else {
      log("Pass a file with a list of domains to tcrawl using the -f option")
    }
  } else {
    const url = str2url(arg)
    if (url) {
      _crawl(port, host, url, ((success, err) => {
        if (success) {
          log(`Crawling ${chalk.bold(url.href)}`)
        }
      }))
    } else {
      country(port, host, arg.toLowerCase(), () => {
        log(`Turbo Crawl will crawl ${chalk.greenBright(arg)} news` )
      })
    }
  }
}
