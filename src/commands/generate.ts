import GenerateCountries from "../scripts/country"
import GenerateReddit from "../scripts/redditpage"

/**
 * Scrapes /r/politics for a list of domains that can be used for crawling
 * @param callback
 */
export function genreddit(callback: (count: number, filename: string) => void) {
  GenerateReddit(callback)
}

export function gencountries(callback: (count: number) => void) {
  GenerateCountries(callback)
}
