import crawl, { random } from "./crawl"
import { gencountries, genreddit } from "./generate"
import { list, ping } from "./get"
import { end, endall, exit, pause, pauseall, resume, resumeall } from "./manage"
import crawlNational from "./news"

export default {
  crawl,
  crawlNational,
  end,
  endall,
  exit,
  gencountries,
  genreddit,
  list,
  pause,
  pauseall,
  ping,
  random,
  resume,
  resumeall,
}
