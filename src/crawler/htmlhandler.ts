
interface HTMLHandlerResult {
  success: boolean
  body: any
}

type onHTMLHandledCallback = (url: URL, result: HTMLHandlerResult) => void

//implement HTMLHandler
//then add it to crawler.htmlHandlers as default handler
//then call all handlers after urlhandler is called
export default class HTMLHandler {
  handle(url: URL, onHTMLHandled: onHTMLHandledCallback) {
    process.nextTick(() => {
      onHTMLHandled(urlcopy, html)
    })
  }
}