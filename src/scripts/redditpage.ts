const hittp = require("hittp")
import { JSDOM } from "jsdom"
import { writeFileSync, accessSync, mkdirSync } from "fs"

export default function(callback: (count: number) => void) {
  const url = hittp.str2url("https://www.reddit.com/r/politics/wiki/whitelist")
  hittp.get(url).then((html: string) => {
    const dom = new JSDOM(html, {url})
    const document = dom.window.document
    const websites = document.querySelectorAll("table>tbody>tr")
    let domains: any = []
    for (let candidate of websites) {
      if (!candidate) continue
      let website: any|HTMLTableDataCellElement = candidate.querySelectorAll("td")
      website = website ? website[3].textContent.trim().toLowerCase() : ""
      website = hittp.str2url(website)
      if (website) domains.push(website.origin)
    }
    try { 
      accessSync("./.turbocrawl/default/domains")
    } catch (err) {
      mkdirSync("./.turbocrawl/default/domains", {recursive: true})
    }
    writeFileSync("./.turbocrawl/default/domains/reddit_r_politics_whitelist", domains.join("\n"))
    callback(domains.length)
  })
}