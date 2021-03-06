import { accessSync, appendFileSync, mkdirSync, writeFileSync } from "fs"
import hittp from "hittp"
import { JSDOM } from "jsdom"
import { join } from "path"

export default async function(callback?: (count: number) => void) {
  const ORIGIN = "https://en.wikipedia.org"
  const START_URL = `${ORIGIN}/wiki/Category:News_websites_by_country`
  const path = join(".", ".turbocrawl", "default", "countries")
  try {
    accessSync(path)
  } catch (err) {
    mkdirSync(path, {recursive: true})
  }
  hittp.setLogLevel("debug")
  const options = { delay_ms: 300, cachePath: "./.cache" }
  let html = await hittp.get(hittp.str2url(START_URL), options)
  const dom = new JSDOM(html, {url: START_URL})
  const document = dom.window.document
  const countries = document.querySelectorAll("div.mw-category > div.mw-category-group > ul > li")
  const names = []
  for (const country of countries) {
    let name: any = country.querySelectorAll("a")
    if (name.textContent) {
      name = name[0].textContent
      name = name.slice(0, name.indexOf("news websites")).trim()
      names.push(name)
    }
  }
  try {
    writeFileSync("./.turbocrawl/default/countries.json", JSON.stringify(names))
  // tslint:disable-next-line: no-empty
  } catch {}
    // let dirname = "./.turbocrawl/default/countries"
    // let filenames = readdirSync(dirname)
    // for (let filename of filenames) {
    //   unlinkSync(join(dirname, filename))
    // }
  for (const country of countries) {
    let countryname: any = country.querySelectorAll("a")
    countryname = countryname[0].textContent
    countryname = countryname.slice(0, countryname.indexOf("news websites")).trim().toLowerCase()
    const path = `./.turbocrawl/default/countries/${countryname}`
    try {
      accessSync(path)
      // console.log("Skipping", countryname)
      // continue
    // tslint:disable-next-line: no-empty
    } catch (err) {}
    const link = country.querySelectorAll("a")
    const href = link[0].getAttribute("href")
    // console.log(`${ORIGIN}${href}`)
    try {
      html = await hittp.get(hittp.str2url(`${ORIGIN}${href}`), options)
    } catch {
      continue
    }
    const dom = new JSDOM(html, {url: `${ORIGIN}${href}`})
    const document = dom.window.document
    const newsWebsites = document.querySelectorAll("div.mw-content-ltr * ul > li")
    // console.log(newsWebsites.length, countryname, "websites")
    for (const website of newsWebsites) {
      const link = website.querySelectorAll("a")
      if (!link[0]) { continue }
      let href = link[0].getAttribute("href") || ""
      const hrefsplit = href.split("/")
      // console.log(hrefsplit)
      if (!hrefsplit[1] || hrefsplit[1] !== "wiki") { continue }
      if (!hrefsplit[2]) { continue }
      if (hrefsplit[2].indexOf(":") !== -1) { continue }
      href = `${ORIGIN}${href}`
      // console.log(`\t ${href}`)
      try {
        html = await hittp.get(hittp.str2url(href), options)
      } catch {
        continue
      }
      const dom = new JSDOM(html, {url: href})
      const document = dom.window.document
      const websites = document.querySelectorAll("table.infobox>tbody>tr")
      for (const candidate of websites) {
        if (!candidate) { continue }
        let scope: any|HTMLTableHeaderCellElement = candidate.querySelector("th")
        scope = scope ? scope.textContent.trim().toLowerCase() : ""
        if (scope === "website") {
          let href: any = candidate.querySelector("a")
          if (!href) { continue }
          href = href.getAttribute("href")
          if (!href || href.length === 0) { continue }
          // console.log(`\t\t${href}`)
          try {
            if (href) { appendFileSync(path, href + "\n") }
          } catch {
            continue
          }
        }
      }
    }
  }
  if (callback) { callback(5000) }
}
