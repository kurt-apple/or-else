import { Model } from 'pinia-orm'
import { Num, Attr, Str, Uid } from 'pinia-orm/dist/decorators'
import AxiosPiniaCRUD from '../AxiosPiniaCRUD'
import { api } from 'src/boot/axios'

export class User extends Model {
  static entity = 'users'
  //static primaryKey: string | string[] = 'id'
  @Uid() declare id: string
  @Str('DEFAULT') declare name: string
  @Num(0.95) declare completionRateThreshold: number
  @Num(2) declare currentSampleRate: number
  @Num(0) declare timeZoneOffset: number
  @Num(2000) declare startingRation: number
  @Attr() declare startDate: Date
  static piniaOptions = {
    actions: {
      ...AxiosPiniaCRUD.generateActions<User>(this.entity),
      async getDefaultUser() {
        const response = await api.get(`/${User.entity}/1`, {
          headers: {
            /*Authorization: authenticationStore.getBearerToken*/
          },
          params: {},
        })
        this.save(response.data)
        return response
      }
    }
  }
}