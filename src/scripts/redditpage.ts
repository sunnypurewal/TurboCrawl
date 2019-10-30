import { accessSync, mkdirSync, writeFileSync } from "fs"
import hittp from "hittp"
import { JSDOM } from "jsdom"

export default function(callback: (count: number, filename: string) => void) {
  const path = "./.turbocrawl/default/domains"
  const url = hittp.str2url("https://www.reddit.com/r/politics/wiki/whitelist")
  hittp.get(url, {cache: false}).then((html: string) => {
    const dom = new JSDOM(html, {url: url.href})
    const document = dom.window.document
    const websites = document.querySelectorAll("table>tbody>tr")
    const domains: any = []
    for (const candidate of websites) {
      if (!candidate) { continue }
      let website: any|HTMLTableDataCellElement = candidate.querySelectorAll("td")
      website = website ? website[3].textContent.trim().toLowerCase() : ""
      website = hittp.str2url(website)
      if (website) { domains.push(website.origin) }
    }
    try {
      accessSync(path)
    } catch (err) {
      mkdirSync(path, {recursive: true})
    }
    const filename = `${path}/reddit_r_politics_whitelist`
    writeFileSync(filename, domains.join("\n"))
    callback(domains.length, filename)
  })
}
