import { HasMany, Model, useRepo } from 'pinia-orm'
import { BelongsTo, Attr, Bool, Uid } from 'pinia-orm/dist/decorators'
import { Habit } from '../habit/habit'
import DailyLog from '../daily-log/daily-log'
import AxiosPiniaCRUD from '../AxiosPiniaCRUD'
import TheGreatHydrator from '../TheGreatHydrator'
import NotAnORM from '../NotAnORM'

export default class CompletionEntry extends Model {
  static entity = 'completions'
  //static primaryKey: string | string[] = 'id'
  @Uid() declare id: string
  @Attr(null) declare habitID: number
  @Attr(null) declare dailyLogID: number
  @Bool(false) declare completed: boolean
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
  get habit () {
    return NotAnORM.getRelated(useRepo(Habit), this.habitID)
  }
}