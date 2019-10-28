import { Readable, Transform, Writable, EventEmitter } from "stream"

export interface CrawlerFactory {
  create(domain: URL): Crawler
}

export interface Crawler extends EventEmitter {
  start(): void
  pause(): void
  resume(): void
  exit(): void
  id: string
  detector: Readable
  consumer: Writable
  urlHandler: URLHandler
  scraper: Scraper
  domain: URL
}

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

export interface CrawlConsumer extends Writable {
  domain: URL
  options?: any
}

export interface LinkDetector extends Readable {
  domain: URL
  options?: any
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