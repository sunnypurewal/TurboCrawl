import chalk from "chalk"
const log = console.log
import { genreddit, gencountries } from "../commands/generate"

export default function generate(args: string[]) {
  let arg = args[3]
  if (!arg || arg.length === 0) {
    log(chalk.blueBright("\nThe generate command:")  
    + "\nAutomatically generates lists of websites to be crawled"
    + "\n  tcrawl generate reddit\n    Scrapes news websites from reddit.com/r/politics white list."
    + "\n  tcrawl generate countries\n    Scrapes national news websites from " 
    + chalk.bold("Wikipedia Category:News websites by country"))
    return
  } else if (arg === "reddit") {
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