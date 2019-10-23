import { Readable } from "stream"

export interface URLHandler {
  handle(url: URL, callback: onURLHandledCallback): void
  stream(url: URL, callback: onHTMLStreamCallback): void
}

export interface WebPageParser {
  parse(page: WebPage, onPageParsed: onPageParsedCallback): void
  /**
   * 
   * @param htmlstream A stream.Readable stream of valid HTML
   * @param callback Function that handles the stream.Readable result of parsing the HTML
   */
  stream(url: URL, htmlstream: Readable, callback: onParserStreamCallback): void
}

export interface ParsedPageConsumer {
  consume(parsedPage: ParsedWebPage, callback: onParsedPageConsumedCallback): void
  stream(url: URL, parsedPageStream: Readable, callback: onParsedPageStreamedCallback): void
}

export interface ParsedWebPage {
  webpage: WebPage
  result: any
}

export interface WebPage {
  url: URL
  html: string|Buffer
}


export type onPageParsedCallback = (parsed: ParsedWebPage) => void
export type onParserStreamCallback = (url: URL, parserstream: Readable) => void

export type onURLHandledCallback = (webpage: WebPage) => void
export type onHTMLStreamCallback = (url: URL, htmlstream: Readable) => void

export type onParsedPageConsumedCallback = () => void
export type onParsedPageStreamedCallback = () => void