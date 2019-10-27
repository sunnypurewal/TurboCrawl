import { ParsedPageConsumer, ParsedWebPage, onParsedPageConsumedCallback, onParsedPageStreamedCallback, CrawlConsumer } from "../../interface";
import { Readable, Writable } from "stream";
import { createWriteStream, PathLike, WriteStream } from "fs"


export default class FileConsumer extends Writable implements CrawlConsumer {
  domain: URL;
  options?: any;
  filestream: Writable
  constructor(domain: URL, options?: any) {
    options = options || {}
    super(options)
    this.domain = domain
    this.options = options
    this.filestream = createWriteStream(options.filepath, options)
  }
  _write(chunk: any, encoding: string, callback: (error?: Error | null) => void) {
    this.filestream.write(chunk, callback)
  }
}