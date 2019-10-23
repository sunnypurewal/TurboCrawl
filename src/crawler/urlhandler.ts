const hittp = require("hittp")

type onURLHandledCallback = (webpage: WebPage) => void

export default class URLHandler {
  handle(url: URL, onURLHandled: onURLHandledCallback) {
    const urlcopy = url
    hittp.get(urlcopy).then((html: string|Buffer) => {
      process.nextTick(() => {
        onURLHandled(urlcopy, html)
      })
    })
  }
}