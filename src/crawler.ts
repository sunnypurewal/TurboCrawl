import Crawler from "./crawler/crawler";
const { str2url } = require("hittp")

const url = str2url(process.argv[2])
if (!url) throw new Error(`"${process.argv[2]}" is not a valid URL`)
const crawler = new Crawler(url)
crawler.start()