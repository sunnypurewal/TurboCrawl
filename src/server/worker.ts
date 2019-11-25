import { str2url } from "hittp"

process.on("message", (msg) => {
  const url = str2url(msg)
  if (!url) return
  console.log(url)
})