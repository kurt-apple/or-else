import { Model } from 'pinia-orm'
import { Uid, Str, Num, Attr, BelongsTo } from 'pinia-orm/dist/decorators'
import { User } from '../user/user'

export default class DailyLog extends Model {
  static entity = 'daily-logs'
  @Attr(null) declare id: number | null
  @Attr(null) declare userId: number | null
  @Str('') declare logDate: Date
  @Num(2000) declare todaysRation: number
  @Num(2) declare todaysSampleRate: number
  @BelongsTo(() => User, 'userId') declare user: User | null
  get dateValue () {
    ///TODO: what is the best way to handle dates and timezone offset in js nowadays?
    ///TODO: can I use a Date object as a property of a pinia-orm model when it goes back and forth from a backend?
    return new Date(this.date)
  }
}