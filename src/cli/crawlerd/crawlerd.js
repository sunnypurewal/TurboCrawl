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

server.on("connect", (req, socket, head) => {
  console.log("Server received connection")
})

const PORT = parseInt(process.argv[2]) || 49202
const HOST = process.argv[3] || "0.0.0.0"
server.listen(PORT, HOST, () => {
  console.log(chalk.blue(`
  Turbo Crawl Daemon is now running in the background
    Listening on port: ${PORT}
    ${HOST === "0.0.0.0" ? "and is accessible on your network" : "and is only available locally"}
  Press any key to return to prompt.
  `))
}, )



process.on("exit", () => {
  console.log(chalk.red("Turbo Crawl Daemon exited"))
})