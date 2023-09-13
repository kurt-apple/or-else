import { Model } from 'pinia-orm'
import { BelongsTo, Attr, Bool } from 'pinia-orm/dist/decorators'
import { Habit } from '../habit/habit'
import DailyLog from '../daily-log/daily-log'
import AxiosPiniaCRUD from '../AxiosPiniaCRUD'

export default class CompletionEntry extends Model {
  static entity = 'completions'

  @Attr(null) declare id: number | null
  @Attr() declare habitId: number
  @Attr() declare dailyLogId: number
  @Bool(false) declare complete: boolean
  @BelongsTo(() => Habit, 'habitId') declare habit: Habit
  @BelongsTo(() => DailyLog, 'dailyLogId') declare log: DailyLog
  static piniaOptions = {
    actions: {
      ...AxiosPiniaCRUD.generateActions<CompletionEntry>(this.entity)
    }
  }
}