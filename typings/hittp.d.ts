declare module "hittp" {
  import { Readable } from "stream";
  function str2url(str: string): URL
  function configure(options: any): void
  function stream(url: URL, options?: any): Promise<Readable>
  function get(url: URL, options?: any): Promise<string>
  function cancel(url: URL): void
  function setLogLevel(level: string): void
  function on(event: string, callback: any): void
}