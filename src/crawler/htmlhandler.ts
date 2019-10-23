import HandlerResult from "./handler"

type onHTMLHandledCallback = (url: URL, result: HandlerResult) => void

//implement HTMLHandler
//then add it to crawler.htmlHandlers as default handler
//then call all handlers after urlhandler is called
export default class HTMLHandler {
  handle(url: URL, onHTMLHandled: onHTMLHandledCallback) {
    const urlcopy = url
    process.nextTick(() => {
      onHTMLHandled(urlcopy, {error: new Error("Not implemented"), body: null})
    })
  }
}