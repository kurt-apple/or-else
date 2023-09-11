import { Model } from 'pinia-orm'
import { Uid, Str, Num, BelongsTo, Attr, Bool } from 'pinia-orm/dist/decorators'
import DailyLog from '../daily-log/daily-log'
import { User } from '../user/user'
import { Habit } from '../habit/habit'

export default class CompletionEntry extends Model {
  static entity = 'completion-entries'

  @Uid() declare id: string
  @Attr(null) declare habitId: string | null
  @Attr(null) declare dailyLogId: string | null
  @Bool(true) declare completed: boolean
  @BelongsTo(() => Habit, 'habitId') declare habit: Habit | null
  @BelongsTo(() => DailyLog, 'dayId') declare date: DailyLog | null
}