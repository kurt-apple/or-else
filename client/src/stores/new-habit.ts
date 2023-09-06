import { Model } from 'pinia-orm'
import { Attr, Num, Str } from 'pinia-orm/dist/decorators'
import AxiosPiniaCRUD from './AxiosPiniaCRUD'

export class newHabit extends Model {
  static entity = 'newhabits'
  @Attr(null) declare id: number | null
  @Str('') declare title: string
  @Num(0) declare times_sampled: number
  @Num(0) declare times_completed: number
  static piniaOptions = {
    ...AxiosPiniaCRUD.generateActions<newHabit>()
  }
}