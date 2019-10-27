import { readFileSync } from "fs"
import { str2url } from "hittp"

export function domainsFromFile(path: string): URL[] {
  let domains: Buffer|string|any = readFileSync(path)
  domains = domains.toString().split("\n")
  domains = domains.filter((d: string) => d.length > 0)
  domains = domains.map((d: string) => str2url(d))
  return domains
}