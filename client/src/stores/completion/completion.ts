import { Model } from 'pinia-orm'
import { Uid, Str, Num, BelongsTo, Attr, Bool } from 'pinia-orm/dist/decorators'
import { Habit } from '../habit/habit'
import DailyLog from '../daily-log/daily-log'

export default class CompletionEntry extends Model {
  static entity = 'completion-entries'

  @Attr(null) declare id: number | null
  @Attr(null) declare habitId: string | null
  @Attr() declare dailyLogId: number
  @Bool(false) declare complete: boolean
  @BelongsTo(() => Habit, 'habitId') declare habit: Habit
  @BelongsTo(() => DailyLog, 'dailyLogId') declare log: DailyLog
}