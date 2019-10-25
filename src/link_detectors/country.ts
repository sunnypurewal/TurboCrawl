const hittp = require("hittp")
import { JSDOM } from "jsdom"
import { writeFileSync, createWriteStream, mkdir, appendFile, appendFileSync, access, accessSync } from "fs"

const ORIGIN = "https://en.wikipedia.org"
const START_URL = `${ORIGIN}/wiki/Category:News_websites_by_country`
hittp.configure({delay_ms: 300, cachePath: "./.cache"})
hittp.get(START_URL).then((html: string) => {
  const dom = new JSDOM(html, {url: START_URL})
  const document = dom.window.document
  const countries = document.querySelectorAll("div.mw-category > div.mw-category-group > ul > li")
  let names = []
  for (const country of countries) {
    let name: any = country.querySelectorAll("a")
    name = name[0].textContent
    name = name.slice(0, name.indexOf("news websites")).trim()
    names.push(name)
  }
  // writeFileSync("./.turbocrawl/default/countries.json", JSON.stringify(names))
  for (const country of countries) {
    let link = country.querySelectorAll("a")
    let href = link[0].getAttribute("href")
    console.log(`${ORIGIN}${href}`)
    hittp.get(`${ORIGIN}${href}`).then((html: string) => {
      const dom = new JSDOM(html, {url: `${ORIGIN}${href}`})
      const document = dom.window.document
      const news_websites = document.querySelectorAll("div.mw-content-ltr * ul > li")
      let countryname: any = country.querySelectorAll("a")
      countryname = countryname[0].textContent
      countryname = countryname.slice(0, countryname.indexOf("news websites")).trim()
      console.log(news_websites.length, countryname, "websites")
      let path = `./.turbocrawl/default/countries/${countryname}`
      try {
        accessSync(path)
        console.log("Skipping", countryname)
        return
      }
      catch (err) {
      }
      for (const website of news_websites) {
        let link = website.querySelectorAll("a")
        if (!link[0]) continue
        let href = link[0].getAttribute("href") || ""
        let hrefsplit = href.split("/")
        // console.log(hrefsplit)
        if (!hrefsplit[1] || hrefsplit[1] !== "wiki") continue
        if (!hrefsplit[2]) continue
        if (hrefsplit[2].indexOf(":") !== -1) continue
        href = `${ORIGIN}${href}`
        console.log(`\t ${href}`)
        hittp.get(href).then((html: string) => {
          const dom = new JSDOM(html, {url: href})
          const document = dom.window.document
          const websites = document.querySelectorAll("table.infobox>tbody>tr")
          for (let candidate of websites) {
            if (!candidate) continue
            let scope: any|HTMLTableHeaderCellElement = candidate.querySelector("th")
            scope = scope ? scope.textContent.trim().toLowerCase() : ""
            if (scope === "website") {
              let href: any = candidate.querySelector("a")
              if (!href) continue
              href = href.getAttribute("href")
              if (!href || href.length === 0) continue
              console.log(`\t\t${href}`)
              if (href) appendFileSync(path, href+"\n")
            }
          }
        })
      }
      // writeFileSync(`./.turbocrawl/default/countries/${country}.json`, JSON.stringify())
    })
  }
}).catch((err: Error) => {
  console.error(err.message)
})