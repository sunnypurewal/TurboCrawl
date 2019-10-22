import stream from "stream"

export default interface LinkDetector {
  stream: (url: URL | string, options: any) => Promise<stream.Readable>
}