import { domainsFromFile } from "./helpers"
const shuffle = require("knuth-shuffle").knuthShuffle
import { bulkCrawl } from "./crawl"
import { accessSync, mkdirSync, readdirSync } from "fs"
import { gencountries } from "./generate"

function _country(port: number, host: string, path: string, country: string, callback?: () => void) {
  let domains = domainsFromFile(`${path}/${country}`)
  shuffle(domains)
  bulkCrawl(port, host, domains)
}

export function country(port: number, host: string, country: string, callback?: () => void) {
  let path = "./.turbocrawl/default/countries"
  try {
    accessSync(path)
  } catch (err) {
    mkdirSync(path, {recursive: true})
  }

  let countriesjson = "./.turbocrawl/default/countries.json"
  try {
    accessSync(countriesjson)
  } catch (err) {
    gencountries((count) => {
      _country(port, host, path, country, callback)
    })
    return
  }
  let filenames = readdirSync(path).filter((d) => {
    return d !== undefined && d !== null && d != path
  })
  if (filenames.length === 0) {
    gencountries((count) => {
      _country(port, host, path, country, callback)
    })
  } else {
    _country(port, host, path, country, callback)
  }
}