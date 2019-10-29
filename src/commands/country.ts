import { accessSync, mkdirSync, readdirSync } from "fs"
import knuth from "knuth-shuffle"
import { bulkCrawl } from "./crawl"
import { gencountries } from "./generate"
import { domainsFromFile } from "./helpers"

const shuffle = knuth.knuthShuffle

function _country(port: number, host: string, path: string, country: string, callback?: () => void) {
  const domains = domainsFromFile(`${path}/${country}`)
  shuffle(domains)
  bulkCrawl(port, host, domains)
}

export function country(port: number, host: string, country: string, callback?: () => void) {
  const path = "./.turbocrawl/default/countries"
  try {
    accessSync(path)
  } catch (err) {
    mkdirSync(path, {recursive: true})
  }

  const countriesjson = "./.turbocrawl/default/countries.json"
  try {
    accessSync(countriesjson)
  } catch (err) {
    gencountries((count) => {
      _country(port, host, path, country, callback)
    })
    return
  }
  const filenames = readdirSync(path).filter((d) => {
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
