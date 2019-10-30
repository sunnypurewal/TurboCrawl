import { accessSync, mkdirSync, readdirSync } from "fs"
import crawl from "./crawl"
import { gencountries } from "./generate"
import { domainsFromFile } from "./helpers"

function shuffle(array: any[]) {
  for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = array[i];
      array[i] = array[j];
      array[j] = temp;
  }
}

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
