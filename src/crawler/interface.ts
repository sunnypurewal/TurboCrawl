import { Readable, Transform, Writable } from "stream"

export interface URLHandler {
  /**
   * Implement the handle method to fetch the contents of the URL
   * and return an HTML representation
   * @param {URL} url URL that needs to be handled
   * @param callback and return an  in this callback 
   */
  handle(url: URL, callback: onURLHandledCallback): void
  stream(url: URL, callback: onHTMLStreamCallback): void
  cancel(host: string): void
}

export class WebPageParser extends Transform {
  static create(url: URL, htmlstream: Readable, options?: any): WebPageParser {
    throw new Error("Not implemented")
  }
}

export class ParsedPageConsumer extends Writable {
  static create(url: URL, parsedPageStream: Readable, options?: any): ParsedPageConsumer {
    throw new Error("Not implemented")
  }
}

/**
 * Scrapers must implement this one method that returns a transform stream.
 * create() will be called on each url handled 
 * and the html will stream to the Transform stream returned from create().
 * See MetadataScraper for a default implementation
 */
export interface Scraper {
  create(options?: any): Transform
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
export type onHTMLStreamCallback = (url: URL, htmlstream?: Readable, error?: Error) => void

export type onParsedPageConsumedCallback = () => void
export type onParsedPageStreamedCallback = () => void