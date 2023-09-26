import { AxiosError } from 'axios'
import axios from 'axios'
import { DailyLog } from './stores/daily-log/daily-log-store'

export default class Utils {
  static check<T>(t: T | undefined | null, mode: 'warn' | 'err', memo: string) {
    if (typeof t === 'undefined' || t == null) {
      if (mode === 'err') throw new Error(`variable was undefined - ${memo}`)
      if (mode === 'warn') console.warn(`variable was undefined - ${memo}`)
    }
    return t
  }
  static hardCheck<T>(t: T | undefined | null, memo: string): T {
    if (typeof t === 'undefined' || t == null) {
      throw new Error(`variable was undefined - ${memo}`)
    }
    return t
  }
  static handleError(memo: string) {
    return (error: Error | AxiosError) => {
      if (axios.isAxiosError(error)) {
        console.warn(`Axios Error - ${memo}`)
        console.log(error)
      } else {
        console.warn(`Error on Axios usage, possibly not Axios fault - ${memo}`)
        console.log(error)
      }
    }
  }
  static t(val: string) {
    return this.d(val).getTime()
  }
  static d(val: string) {
    return new Date(val)
  }
  //sorting function for two dailylogs
  static mddl(one: DailyLog, two: DailyLog, dir: 'asc' | 'desc') {
    return (this.t(one.logDate) - this.t(two.logDate)) * (dir == 'asc' ? 1 : -1)
  }
}
