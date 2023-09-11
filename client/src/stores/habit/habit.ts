import { Attr, Num, Str, BelongsTo } from 'pinia-orm/dist/decorators'
import { Model } from 'pinia-orm'
import AxiosPiniaCRUD from '../AxiosPiniaCRUD'
import { User } from '../user/user'
//import User from 'stores/user/user'

export class Habit extends Model {
  static entity = 'habits'
  @Attr(null) declare id: number | null
  @Attr(null) declare userID: number
  @Str('') declare title: string
  @Num(0) declare times_sampled: number
  @Num(0) declare times_completed: number
  @BelongsTo(() => User, 'userID') declare user: User | null
  static piniaOptions = {
    actions: {
      ...AxiosPiniaCRUD.generateActions<Habit>(this.entity),
    }
  }
  get completionRate () {
    if(this.times_sampled == 0 || this.times_sampled == null) return 0.0
    return this.times_completed / this.times_sampled
  }
}
