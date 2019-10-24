import { Readable } from "stream"

export default class LinkDetector extends Readable {
  /**
   * 
   * @param URL 
   */
  static create(url: URL | string, options: any): LinkDetector {
    throw new Error("Not implemented")
  }
  // stream: (url: URL | string, options: any) => Promise<Readable>
  // end: (callback: ()=>void) => void
}