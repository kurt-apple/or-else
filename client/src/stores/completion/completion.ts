import { HasMany, Model, useRepo } from 'pinia-orm'
import { BelongsTo, Attr, Bool, Uid, Num } from 'pinia-orm/dist/decorators'
import { Habit } from '../habit/habit'
import DailyLog from '../daily-log/daily-log'
import AxiosPiniaCRUD from '../AxiosPiniaCRUD'
import TheGreatHydrator from '../TheGreatHydrator'
import NotAnORM from '../NotAnORM'

// UNSPECIFIED = 0
// COMPLETED = 2
// NOTCOMPLETED = 1

export default class CompletionEntry extends Model {
  static entity = 'completions'
  //static primaryKey: string | string[] = 'id'
  @Uid() declare id: string
  @Attr(null) declare habitID: number
  @Num(-1) declare dailyLogID: number
  @Num(0) declare status: 0 | 1 | 2
  //@BelongsTo(() => Habit, 'habitID') declare habit: Habit
  //@BelongsTo(() => DailyLog, 'dailyLogID') declare log: DailyLog
  static piniaOptions = {
    actions: {
      ...AxiosPiniaCRUD.generateActions<CompletionEntry>(this.entity)
    }
  }
  get dailyLog () {
    return NotAnORM.getRelated(useRepo(DailyLog), this.dailyLogID)
  }
  get dateValue () {
    return this.dailyLog.dateValue
  }
  get habit () {
    return NotAnORM.getRelated(useRepo(Habit), this.habitID)
  }
}