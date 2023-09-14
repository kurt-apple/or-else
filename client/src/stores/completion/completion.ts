import { Model } from 'pinia-orm'
import { BelongsTo, Attr, Bool } from 'pinia-orm/dist/decorators'
import { Habit } from '../habit/habit'
import DailyLog from '../daily-log/daily-log'
import AxiosPiniaCRUD from '../AxiosPiniaCRUD'

export default class CompletionEntry extends Model {
  static entity = 'completions'

  @Attr(null) declare id: number | null
  @Attr(null) declare habitID: number | null
  @Attr(null) declare dailyLogID: number | null
  @Bool(false) declare completed: boolean
  @BelongsTo(() => Habit, 'habitID') declare habit: Habit | null
  @BelongsTo(() => DailyLog, 'dailyLogID') declare log: DailyLog | null
  static piniaOptions = {
    actions: {
      ...AxiosPiniaCRUD.generateActions<CompletionEntry>(this.entity)
    }
  }
}