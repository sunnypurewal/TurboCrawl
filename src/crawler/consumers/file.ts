import { ParsedPageConsumer, ParsedWebPage, onParsedPageConsumedCallback, onParsedPageStreamedCallback } from "../interface";
import { Readable, Writable } from "stream";
import { createWriteStream, PathLike, WriteStream } from "fs"


export default class FileConsumer extends Writable {
  static create(filename: string, options?: any): FileConsumer {
    return createWriteStream(filename, options)
  }
}