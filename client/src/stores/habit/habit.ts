import { Attr, Num, Str } from 'pinia-orm/dist/decorators'
import { Model } from 'pinia-orm'
import AxiosPiniaCRUD from '../AxiosPiniaCRUD'
//import User from 'stores/user/user'

export class Habit extends Model {
	static entity = 'habits'
	@Attr(null) declare id: number | null
	//@Attr() declare userId: number
	@Str('') declare title: string
	@Num(0) declare times_sampled: number
	@Num(0) declare times_completed: number
	//@BelongsTo(() => User, 'userId') declare user: User | null
	static piniaOptions = {
		actions: {
			...AxiosPiniaCRUD.generateActions<Habit>(this.entity)
		}
	}
}