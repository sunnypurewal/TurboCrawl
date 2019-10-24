import stream from "stream"

export default interface LinkDetector {
  /**
   * 
   * @param URL 
   */
  stream: (url: URL | string, options: any) => Promise<stream.Readable>
  end: (callback: ()=>void) => void
}