# Turbo Crawl
  The simple and fast crawling framework.

## Overview

Turbo Crawl is designed with the following principles:

- **Works out of the box -** The default settings will produce a useful output.
- **Streams -** Every interface is implemented using Node.js Streams for high performance
- **Easy Plugins -** TypeScript interfaces can be implemented to customize functionality.

## Quick Start

Open a terminal in an empty directory.

`$ npm i tcrawl`

`$ alias tcrawl="node_modules/tcrawl/build/cli.js"`

`$ tcrawl`

You now have access to the CLI and can run Turbo Crawl with default settings. Refer to the [CLI documentation](https://github.com/sunnypurewal/tcrawl).

## Usage
```
import { Server } from "turbocrawl"
/* const { Server } = require("turbocrawl") */
const server = new Server()
server.listen(() => {
  console.log("Turbo Crawl server is listening on port 8088)
})
```

Now that the server is running, you can interact with it using the Client

```
import { Client } from "turbocrawl"
/* const { Client } = require("turbocrawl") */
const client = new Client(8088, "localhost")
client.crawl(["www.cnn.com", "www.nytimes.com", "www.newyorker.com"], (statusCode, response) => {
  console.log(statusCode, response)
})
client.listCrawlers((crawlers) => {
  console.log(crawlers)
})
```

## Customization

The Server constructor takes 3 optional arguments: 

```
constructor(port: number = 8088, 
            host: string = "localhost", 
            crawlerFactory: ICrawlerFactory = new DomainCrawlerFactory())
```

### Crawlers and the Crawler Factory
The entry point to customization is `crawlerFactory` which is responsible for creating a crawler object for each domain that is crawled.

```
interface ICrawlerFactory {
  create(domain: URL): ICrawler
}
```

Note that a crawler takes a domain name URL as input, and is meant for crawling a single website.

There are 4 components to a Crawler. The interface is built with streams so the arrows signify the flow of data from left to right. From `"www.domain.com"` to a `Stream.Writable`

![Turbo Crawl Pipeline](img/pipeline.png)

Each component has a default implementation that works out of the box.

![Default Crawler Pipeline](img/default.png)

You most likely want to use the default URL Handler and customize the other 3 components as you see fit. The easiest way to do this is to extend the default `DomainCrawler` class and replace the `detector`, `scraper`, and `consumer` with your own classes in the constructor.

### Domain Crawler
```
class DomainCrawler extends EventEmitter implements ICrawler {
    constructor(domain: URL,
              consumer: ICrawlConsumer,
              scraper?: IScraper,
              detector?: ILinkDetector)
}
```
```
class MyCustomCrawler extends DomainCrawler {
  constructor(domain: URL) {
    super(domain,
          new MyCustomConsumer(),
          new MyCustomScraper(),
          new MyCustomLinkDetector())
  }
}
```

You can now create the server with your custom crawler factory

```
class MyCustomCrawlerFactory implements ICrawlerFactory {
  public create(domain: URL): DomainCrawler {
    return MyCustomCrawler(domain)
  }
}
import { Server } from "turbocrawl"
/* const { Server } = require("turbocrawl") */
const server = new Server(8088, "localhost", new MyCustomCrawlerFactory())
server.listen(() => {
  console.log("Turbo Crawl server is listening on port 8088 with custom crawler)
})
```

Of course you can choose to customize all or none of these components to suit your needs.

### URL Detector

```
interface ILinkDetector extends Readable {
  domain: URL
  options?: any
  getLinkCount(): number
}
```

The URL Detector is given just a domain name as input and is responsible for finding URLs to scrape on that domain. There is only one URL Detector object per crawler. It is implemented as a Readable Stream so whenever your class has discovered a URL, it should write it to the stream as a string: `this.push(url.href)`. When the stream ends, the getLinkCount() method should return the number of URLs that were detected to ensure that resources are cleaned up properly.

The default Detector will find a website's [Sitemap](http://sitemaps.org), usually in its `robots.txt`, and then extract webpages that have been modified in the past 48 hours. It is useful for news websites which often have up-to-date and valid sitemaps. The implementation is not tolerant of invalid sitemap entries; it will only find webpages since a specified date, and ignores sitemap entries without a valid date.

### Scraper

```
export interface IScraperFactory {
  create(options?: any): Transform
}
```

The Scraper Factory returns a Transform stream that takes an HTML stream as input, and outputs a stream of scraped data. A new scraper object is created for each webpage visited by a crawler.

The default Scraper returns a JSON object of all of the `<meta>` tags on a webpage which can be useful for extracting structured data such as [Open Graph](https://ogp.me) or [Schema](https://schema.org/).

### Consumer
```
export interface ICrawlConsumer extends Writable {
  domain: URL
  options?: any
}
```

The Consumer is responsible for writing out the scraped data, usually to a file. There is only one Consumer object per crawler.

The default Consumer will write out all Scraper output to a file in `./.turbocrawl/crawled/`.

### URL Handler
```
export interface IURLHandler {
  stream(url: URL, callback: (url: URL, htmlstream?: Readable, err?: Error) => void): void
}
```

The URL handler fetches the HTML for each URL discovered by the URL Detector. There is only one URL Handler object per crawler. 

This is the most difficult component to customize, and the default Handler has important features such as per-domain throttling and caching so take care when implementing your own.

## Advanced Customization

The Crawler class has so far only taken a domain name as input e.g. `"www.cnn.com"`. However, using a pass through link detector, one could easily create a crawler that takes a webpage as input and simply crawls that one page. Here's a sample implementation:
```
class PassThroughLinkDetector extends PassThrough implements ILinkDetector {
  public domain: URL
  public options?: any
  constructor(webpage: URL, options?: any) {
    super(options)
    this.options = options
    this.domain = webpage
    this.on("pipe", () => {
      this.push(this.domain.href)
      this.end()
    })
  }
  public getLinkCount(): number {
    return 1
  }
}
```

A custom URL handler could be written that instead of fetching the HTML, could use a [Puppeteer](https://github.com/GoogleChrome/puppeteer) instance to visit each page in order to run JavaScript and scrape dynamic websites.

A custom scraper could use [Mercury Parser](https://github.com/postlight/mercury-parser) to find the body of a news article. You can also try [this npm package](https://www.npmjs.com/package/article) by [Andreas Madson](https://github.com/AndreasMadsen) which attempts to scrape a news article from a stream of HTML and fits in more easily with the architecture of Turbo Crawl since it is based on Streams. Here's some sample code to get you started:
```
const article = require("article")
import { Duplex } from "stream"
class ArticleScrapeStream extends Duplex {
  private parser: any
  constructor(url: URL, options?: any) {
    super(options)
    this.parser = article(url.href, (err, result) => {
      this.push(result.text)
    })
  }
  pipe(destination: any) {
    destination.pipe(this.parser)
  }
}

class ArticleScraperFactory implements IScraperFactory {
  public create(options: any): ReadableStream {
    return new ArticleScrapeStream(options.url)
  }
}
```

A custom consumer class could take scraped news articles and index them straight into an [Elasticsearch](www.elastic.co) database for large scale full text search of historic and breaking news.

A consumer could write out a large corpus of news articles to the filesystem and import it into a NLP library like Python's [NLTK](https://www.nltk.org/).