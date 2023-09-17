import { Model, useRepo } from 'pinia-orm'
import { Attr, Cast, HasMany, Num } from 'pinia-orm/dist/decorators'
import { User } from '../user/user'
import CompletionEntry from '../completion/completion'
import AxiosPiniaCRUD from '../AxiosPiniaCRUD'
import WeightEntry from '../weight-entry/weight-entry'
import { Habit } from '../habit/habit'
import NotAnORM from '../NotAnORM'

export default class DailyLog extends Model {
  static entity = 'daily-logs'
  //static primaryKey: string | string[] = 'id'
  @Attr(null) declare id: number | null
  @Num(-1) declare previousLogID: number
  @Num(-1) declare userID: number
  @Attr() declare logDate: Date
  //@BelongsTo(() => User, 'userID') declare user: User
  //@HasOne(() => DailyLog, 'previousLogID') declare previousLog: DailyLog | null
  @HasMany(() => CompletionEntry, 'dailyLogID') declare completionEntries: CompletionEntry[]
  @HasMany(() => WeightEntry, 'dailyLogID') declare weightEntries: WeightEntry[]

  get formattedDate() {
    return this.dateValue.toLocaleDateString()
  }

  get dateValue() {
    return new Date(this.logDate)
  }

  get notCompleted() {
    return this.completionEntries.filter((x) => x.status == 1)
  }

  get totalCompletedHabits() {
    if(this.completionEntries == null || typeof this.completionEntries === 'undefined') throw new Error(`completion entries is undefined or null for log id ${this.id}`)
    return this.completionEntries
      //completed habits that day
      .filter((x) => x.status == 2).length
  }

  get user() {
    if(this.userID <= 0) throw new Error(`userID of daily log ${this.id} is null.`)
    const usr = NotAnORM.getRelated(useRepo(User), this.userID)
    //console.log("linked user: ", usr)
    return usr
  }

  get previousLog(): DailyLog | null {
    //console.log('previouslogId: ', this.previousLogID)
    if(this.previousLogID <= 0) return null
    const prev = NotAnORM.getRelated(useRepo(DailyLog), this.previousLogID)
    //console.log("previous log: ", prev)
    return prev
  }

  get sampleRate(): number {
    if(this.user == null || typeof this.user === 'undefined') {
      throw new Error('user related to daily log is unknown')
    }
    //console.log('previous log: ', this.previousLog)
    if(this.previousLog == null || typeof this.previousLog === 'undefined') {
      console.log("log ", this.formattedDate, " previousDate couldn't be found")
      return this.user.startingSampleRate || 999
    }
    //console.log("sample rate for ", this.formattedDate, " should be ", (this.previousLog.totalImprovedHabits + 1))
    //console.log("btw, previous log for ", this.formattedDate, " is ", this.previousLog.formattedDate)
    return Math.max(this.previousLog.totalImprovedHabits + 1, this.user.startingSampleRate)
  }

  get sampleHabits() {
    ///todo: ah crap this will change over time. I actually need completion entries to have a bool and create a bunch of entries at the beginning of the day.
    ///to refresh in case of revising yesterday's log:
    ///1. re-sample
    ///2. delete any completion entries that are not marked complete and also not in the new sample list
    
    return useRepo(Habit).orderBy('completionRate', 'asc').limit(this.sampleRate).get()
  }
  reSampleHabits() {
    console.log("re-sampling ", this.formattedDate)
    //1. get all completion entries marked notcompleted
    const notcompleted = this.notCompleted
    //2. reset to unspecified //todo: this could lose data
    notcompleted.forEach((x) => x.status = 0)
    //3. get all new samples excluding ones that are already completed
    let habits = this.completionEntries.filter((x) => x.status != 2).map((x) => x.habit)
    habits.sort((a, b) => {
      return a.priorCompletionRate(this.dateValue) - b.priorCompletionRate(this.dateValue)
    })
    habits = habits.slice(0, this.sampleRate - 1)
    habits.forEach((x) => {
      x.completionEntries.filter((y: CompletionEntry) => {
        return y.dailyLogID === this.id
      }).forEach((y: CompletionEntry) => {
        y.status = 1
      })
    })
  }
  get totalSampledHabits() {
    ///todo: when a daily log is generated it needs to sample the habits, i.e. pull the right amount from the habits list.
    ///todo: to do so, create completion records for all the sampled habits and set completed to false. Update to true if they are completed that day.
    return this.completionEntries.length
  }
  get totalImprovedHabits() {
    if(typeof this.completionEntries === 'undefined') throw new Error('completion entries is undefined')
    const completed = this.completionEntries
      //completed habits that day
      .filter((x: CompletionEntry) => x.status == 2) 
      //habits less than the completion threshold setting
      .filter((x: CompletionEntry) => x.habit.priorCompletionRate(this.dateValue) < this.user.completionRateThreshold)
      .length
    //console.log("totalImprovedHabits for ", this.formattedDate, " = ", completed)
    return completed
  }
  get ration() {
    if(typeof this.previousLog === 'undefined' || this.previousLog == null) {
      return this.user?.startingRation
    }
    else return (this.previousLog.getTotalCompletedHabits() / this.previousLog.getTotalSampledHabits()) * this.user.startingRation
  }
  get maxWeightEntry() {
    const len = this.weightEntries.length
    if(len == 0) return 0
    if(len == 1) return this.weightEntries[0].weight
    let maxWeight = this.weightEntries[0].weight
    for(let i = 1; i < this.weightEntries.length; i++) {
      if(this.weightEntries[i-1].weight < this.weightEntries[i].weight) {
        maxWeight = this.weightEntries[i].weight
      }
    }
    return maxWeight
  }
  get deltaWeight() {
    if(this.previousLog == null) return 0
    return this.maxWeightEntry - this.previousLog?.maxWeightEntry
  }
  // get generateTomorrow(): DailyLog {
  //   const oneDayFromNow = new Date(this.logDate.getTime() + 86400000)
  //   return {
  //     previousLogId: this.id,
  //     userID: this.userId,
  //     logDate: oneDayFromNow
  //   }
  // }
  static piniaOptions = {
    actions: {
      ...AxiosPiniaCRUD.generateActions<DailyLog>(this.entity)
    }
  }
}
