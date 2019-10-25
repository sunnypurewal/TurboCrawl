
const hittp = require("hittp")
import { JSDOM } from "jsdom"
import { writeFileSync, createWriteStream } from "fs"

const url = hittp.str2url("https://en.wikipedia.org/wiki/The_Sydney_Morning_Herald")
hittp.get(url).then((html: string) => {
  const dom = new JSDOM(html, {url})
  const document = dom.window.document
  const websites = document.querySelectorAll("table.infobox>tbody>tr")
  console.log(websites.length)
  for (let candidate of websites) {
    if (!candidate) continue
    let scope: any|HTMLTableHeaderCellElement = candidate.querySelector("th")
    scope = scope ? scope.textContent.trim().toLowerCase() : ""
    if (scope === "website") {
      console.log(candidate.querySelector("a")!.getAttribute("href"))
    }
  }
})
