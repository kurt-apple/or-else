import { Model } from 'pinia-orm'
import { Uid, Str, Num } from 'pinia-orm/dist/decorators'
import Completion from '../completion/completion'

export default class Day extends Model {
	static entity = 'days'
	@Uid() declare id: string
	@Attr(null) declare userId: string | null
	@Str('') declare date: string
	@BelongsTo(() => User, 'userId') declare user: User | null
}
