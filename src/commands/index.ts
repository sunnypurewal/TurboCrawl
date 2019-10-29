import crawl, { random } from "./crawl"
import { gencountries, genreddit } from "./generate"
import { list } from "./get"
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
  random,
  resume,
  resumeall,
}
