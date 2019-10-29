import { accessSync, mkdirSync, readdirSync } from "fs"
// tslint:disable-next-line: no-var-requires
const knuth = require("knuth-shuffle")
import crawl from "./crawl"
import { gencountries } from "./generate"
import { domainsFromFile } from "./helpers"

const shuffle = knuth.knuthShuffle

function _get(port: number, host: string, path: string, country: string, callback?: (success: boolean) => void) {
  const domains = domainsFromFile(`${path}/${country}`)
  shuffle(domains)
  crawl(port, host, domains, callback)
}

export default function crawlNational(port: number, host: string, country: string, callback?: () => void) {
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
      _get(port, host, path, country, callback)
    })
    return
  }
  const filenames = readdirSync(path).filter((d) => {
    return d !== undefined && d !== null && d !== path
  })
  if (filenames.length === 0) {
    gencountries((_) => {
      _get(port, host, path, country, callback)
    })
  } else {
    _get(port, host, path, country, callback)
  }
}
