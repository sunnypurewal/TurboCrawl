import { ParsedPageConsumer, ParsedWebPage, onParsedPageConsumedCallback, onParsedPageStreamedCallback } from "../interface";
import { Readable } from "stream";
import { createWriteStream } from "fs"


export default class FileConsumer implements ParsedPageConsumer {
  consume(parsedPage: ParsedWebPage, callback: onParsedPageConsumedCallback): void {
    throw new Error("Method not implemented.");
  }  
  stream(url: URL, parsedPageStream: Readable, callback: onParsedPageStreamedCallback): void {
    const file = createWriteStream(`./default.txt`)
    parsedPageStream.pipe(file)
  }

}