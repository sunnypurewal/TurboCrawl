import { ChildProcess, fork } from "child_process"
import os from "os"
import path from "path"

export default class Cluster {
  private workers: ChildProcess[]
  constructor() {
    let cpus = os.cpus().length - 1
    this.workers = new Array(cpus)
    for (let i = 0; i < cpus; i++) {
      console.log(path.join(__dirname, "worker"))
      this.workers.push(fork(path.join(__dirname, "worker")))
    }
  }
  doWork(url: URL) {
    let random = Math.floor(Math.random() * this.workers.length)
    let worker = this.workers[random]
    worker.send(url.href, (err) => {
      console.error("Error sending message to worker", err)
    })
  }
}
