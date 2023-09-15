import { Attr, Num, Str, BelongsTo, HasMany, OnDelete } from 'pinia-orm/dist/decorators'
import { Model } from 'pinia-orm'
import AxiosPiniaCRUD from '../AxiosPiniaCRUD'
import { User } from '../user/user'
import CompletionEntry from '../completion/completion'
//import User from 'stores/user/user'

export class Habit extends Model {
  static entity = 'habits'
  static primaryKey: string | string[] = 'id'
  @Attr(null) declare id: number | null
  @Attr(null) declare userID: number | null
  @Str('') declare title: string
  @Num(0) declare times_sampled: number
  @Num(0) declare times_completed: number
  @BelongsTo(() => User, 'userID') declare user: User | null
  @HasMany(() => CompletionEntry, 'habitID') @OnDelete('cascade') declare completionEntries: CompletionEntry[]
  static piniaOptions = {
    actions: {
      ...AxiosPiniaCRUD.generateActions<Habit>(this.entity)
    }
  }
  get completionRate () {
    if(this.times_sampled == 0 || this.times_sampled == null) return 0.0
    return this.times_completed / this.times_sampled
  }
  get latestCompletionEntry () {
    if(typeof this.completionEntries === 'undefined' || this.completionEntries == null) {
      return null
    }
    if(this.completionEntries.length == 0) {
      return null
    }
    return this.completionEntries.sort((a, b) => {
      if(b.log == null || a.log == null) return 0
      return b.log.logDate.getTime() - a.log.logDate.getTime()
    })[0]
  }
  get wasCompletedToday() {
    const latest = this.latestCompletionEntry
    if(latest == null) return false
    else return latest.complete
  }
  set wasCompletedToday(value) {
    console.log("set wasCompletedToday to ", value)
    const latest = this.latestCompletionEntry
    console.log("completion entry: ", latest)
    ///todo: generate new completion record and/or daily log if null
    if(latest == null) throw new Error("There is no latest entry for this habit.")
    latest.complete = value
  }
}
