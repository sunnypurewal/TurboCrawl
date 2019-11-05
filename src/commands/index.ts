import crawl, { random } from "./crawl"
import { list, ping } from "./get"
import { end, endall, exit, generate, pause, pauseall, resume, resumeall } from "./manage"
import crawlNational from "./news"

export default {
  crawl,
  crawlNational,
  end,
  endall,
  exit,
  generate,
  list,
  pause,
  pauseall,
  ping,
  random,
  resume,
  resumeall,
}
