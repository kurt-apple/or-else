import axios, { AxiosError } from 'axios'
import { DailyLog } from './stores/dailyLog/dailyLogStore'
import { WeightEntry } from './stores/weight-entry/weightEntryStore'
import { Record } from './stores/PiniaGenerics'

export default class Utils {
  static check<T>(t: T | undefined | null, mode: 'warn' | 'err', memo: string) {
    if (typeof t === 'undefined' || t == null) {
      if (mode === 'err') throw new Error(`variable was undefined - ${memo}`)
      if (mode === 'warn') console.warn(`variable was undefined - ${memo}`)
    }
    return t
  }

  static hardCheck<T>(t: T | undefined | null, memo = 'ERROR'): T {
    if (typeof t === 'undefined' || t === null) {
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

  static df(val: string) {
    return new Date(val).toDateString()
  }

  // sorting function for two dailylogs
  static mddl(one: DailyLog, two: DailyLog, dir: 'asc' | 'desc') {
    return (
      (this.t(one.logDate) - this.t(two.logDate)) * (dir === 'asc' ? 1 : -1)
    )
  }

  // sorting function for two weight entries
  static mdwe(one: WeightEntry, two: WeightEntry, dir: 'asc' | 'desc') {
    return (this.t(one.time) - this.t(two.time)) * (dir === 'asc' ? 1 : -1)
  }

  static same24(a: Date, b: Date) {
    // console.log('same24', { a, b })
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    )
  }

  static same24s(a: string, b: string) {
    return this.same24(new Date(a), new Date(b))
  }

  static OnOrBefore(dateStr: string, testInput: string) {
    return (
      this.same24s(dateStr, testInput) ||
      Utils.d(dateStr).getTime() > Utils.d(testInput).getTime()
    )
  }

  // thank you https://stackoverflow.com/a/7228322
  static randbetween(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1) + min)
  }

  // todo: make this work
  // static zeroToUndefined<T>(item: T, ...keys: string[]) {
  //   keys.forEach((k) => {
  //     if(item[k] === 0) item.k = undefined
  //   })
  //   return item
  // }

  static todo(s?: string) {
    throw new Error(s ?? 'needs refactor')
  }

  static notInSet<T extends Record>(arg: T, arr: T[]) {
    return typeof arr.find((y) => y.id === arg.id) === 'undefined'
  }
}
