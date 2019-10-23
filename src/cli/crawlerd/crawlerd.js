console.log(__filename)
const Crawler = require("../../../build/crawler/crawler")
const { createServer } = require("http")
const chalk = require("chalk")


crawl = (url) => {
  let urlcopy = new URL(url.href)
  const crawler = new Crawler(url)
  crawler.start()
}


const server = createServer((req, res) => {
  req.on("data", (chunk) => {
    console.log("Server Received:", chunk)
    res.write(chunk)
  })
})

const PORT = parseInt(process.argv[2]) || 49202
const HOST = process.argv[3] || "0.0.0.0"
server.listen(PORT, HOST, () => {
  console.log(chalk.blue("Turbo Crawl Daemon started"))
}, )

process.on("exit", () => {
  console.log(chalk.red("Turbo Crawl Daemon exited"))
})