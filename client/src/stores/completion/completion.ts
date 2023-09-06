import { Model } from 'pinia-orm'
import { Uid, Str, Num, BelongsTo } from 'pinia-orm/dist/decorators'
import Day from '../date/day'

export default class CompletionEntry extends Model {
  static entity = 'completion-entries'

  @Uid() declare id: string
  @Attr(null) declare userId: string | null
  @Attr(null) declare habitId: string | null
  @Attr(null) declare dayId: string | null
  @Bool(true) declare completed: boolean
  @BelongsTo(() => User, 'userId') declare user: User | null
  @BelongsTo(() => Habit, 'habitId') declare habit: Habit | null
  @BelongsTo(() => Day, 'dayId') declare date: Day | null
}
