import GenerateReddit from "../scripts/redditpage"
import GenerateCountries from "../scripts/country"

/**
 * Scrapes /r/politics for a list of domains that can be used for crawling
 * @param callback 
 */
export function genreddit(callback: (count: number) => void) {
  GenerateReddit(callback)
}

export function gencountries(callback: (count: number) => void) {
  GenerateCountries(callback)
}