import { Model, useRepo } from 'pinia-orm'
import { Attr, BelongsTo, HasOne, HasMany } from 'pinia-orm/dist/decorators'
import { User } from '../user/user'
import CompletionEntry from '../completion/completion'
import AxiosPiniaCRUD from '../AxiosPiniaCRUD'
import WeightEntry from '../weight-entry/weight-entry'
import { Habit } from '../habit/habit'

export default class DailyLog extends Model {
  static entity = 'daily-logs'
  @Attr(null) declare id: number | null
  @Attr(null) declare previousLogID: number | null
  @Attr() declare userID: number
  @Attr() declare logDate: Date
  @BelongsTo(() => User, 'userID') declare user: User
  @HasOne(() => DailyLog, 'previousLogID') declare previousLog: DailyLog | null
  @HasMany(() => CompletionEntry, 'dailyLogID') declare completionEntries: CompletionEntry[]
  @HasMany(() => WeightEntry, 'dailyLogID') declare weightEntries: WeightEntry[]
  get dateValue () {
    ///TODO: what is the best way to handle dates and timezone offset in js nowadays?
    ///TODO: can I use a Date object as a property of a pinia-orm model when it goes back and forth from a backend?
    return new Date(this.date)
  }
  get totalCompletedHabits() {
    ///todo: do has_many completions
    return this.completionEntries
      //completed habits that day
      .filter((x) => x.completed).length
  }
  get sampleRate() {
    if(this.previousLog == null) return this.user.currentSampleRate
    else this.user.currentSampleRate = this.previousLog.totalImprovedHabits + 1
    return this.previousLog.totalImprovedHabits + 1
  }
  get sampleHabits() {
    ///todo: ah crap this will change over time. I actually need completion entries to have a bool and create a bunch of entries at the beginning of the day.
    ///to refresh in case of revising yesterday's log:
    ///1. re-sample
    ///2. delete any completion entries that are not marked complete and also not in the new sample list
    return useRepo(Habit).orderBy('completionRate', 'asc').limit(this.sampleRate)
  }
  get reSampleHabits() {
    const newSample = this.sampleHabits.all()
    const toDelete = this.completionEntries
      .filter((x) => !x.complete)
      .filter((y) => newSample.find((z) => z.id == y.habitId))
    const toCreate = newSample
      .filter((x) => typeof this.completionEntries.find((y) => y.habitId == x.id) === 'undefined')
    useRepo(CompletionEntry).piniaStore().axios_deleteItems(toDelete)
    toCreate.forEach((x) => {
      useRepo(CompletionEntry).piniaStore().axios_createItem({
        habitId: x.id,
        dailyLogId: this.id,
        complete: false
      })
    })
    return this.completionEntries
  }
  get totalSampledHabits() {
    ///todo: when a daily log is generated it needs to sample the habits, i.e. pull the right amount from the habits list.
    ///todo: to do so, create completion records for all the sampled habits and set completed to false. Update to true if they are completed that day.
    return this.completionEntries.length
  }
  get totalImprovedHabits() {
    return this.completionEntries
      //completed habits that day
      .filter((x) => x.completed) 
      //habits less than the completion threshold setting
      .filter((x) => x.habit.completionRate < this.user.completionRateThreshold)
      .length
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
  get generateTomorrow(): DailyLog {
    const oneDayFromNow = new Date(this.logDate.getTime() + 86400000)
    return {
      previousLogId: this.id,
      userID: this.userId,
      logDate: oneDayFromNow
    }
  }
  static piniaOptions = {
    actions: {
      ...AxiosPiniaCRUD.generateActions<DailyLog>(this.entity),
    }
  }
}
