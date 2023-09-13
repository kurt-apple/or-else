import { Attr, Num, Str, BelongsTo, HasMany } from 'pinia-orm/dist/decorators'
import { Model } from 'pinia-orm'
import AxiosPiniaCRUD from '../AxiosPiniaCRUD'
import { User } from '../user/user'
import CompletionEntry from '../completion/completion'
//import User from 'stores/user/user'

export class Habit extends Model {
  static entity = 'habits'
  @Attr(null) declare id: number | null
  @Attr(null) declare userID: number
  @Str('') declare title: string
  @Num(0) declare times_sampled: number
  @Num(0) declare times_completed: number
  @BelongsTo(() => User, 'userID') declare user: User | null
  @HasMany(() => CompletionEntry, 'habitId') declare completionEntries: CompletionEntry[]
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
    if(this.completionEntries.length == 0) {
      return null
    }
    return this.completionEntries.sort((a, b) => b.log.logDate.getTime() - a.log.logDate.getTime())[0]
  }
  get wasCompletedToday() {
    const latest = this.latestCompletionEntry
    if(latest == null) return false
    else return latest.complete
  }
}
