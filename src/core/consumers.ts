import { createWriteStream } from "fs"
import { Writable } from "stream";

export default class ICrawlConsumer extends Writable {
  domain: URL = new URL("https://github.com")
  options?: any
}

export class FileConsumer extends ICrawlConsumer {
  public domain: URL;
  public options?: any;
  public filestream: Writable
  constructor(domain: URL, options?: any) {
    options = options || {}
    super(options)
    this.domain = domain
    this.options = options
    this.filestream = createWriteStream(options.filepath, options)
  }
  public _write(chunk: any, encoding: string, callback: (error?: Error | null) => void) {
    this.filestream.write(chunk, callback)
  }
}
