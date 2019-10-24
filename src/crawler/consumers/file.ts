import { ParsedPageConsumer, ParsedWebPage, onParsedPageConsumedCallback, onParsedPageStreamedCallback } from "../interface";
import { Readable } from "stream";
import { createWriteStream, PathLike, WriteStream } from "fs"


export default class FileConsumer implements ParsedPageConsumer {
  // private filename: PathLike
  private filestream: WriteStream
  constructor(filename: PathLike) {
    // this.filename = filename
    this.filestream = createWriteStream(filename, {flags: "a"})
  }
  consume(parsedPage: ParsedWebPage, callback: onParsedPageConsumedCallback): void {
    throw new Error("Method not implemented.");
  }  
  stream(url: URL, parsedPageStream: Readable, callback: onParsedPageStreamedCallback): void {
    parsedPageStream.pipe(this.filestream)
  }

}