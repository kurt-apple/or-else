import { Model, useStoreActions } from 'pinia-orm';
import { api } from 'src/boot/axios';

export default class AxiosPiniaCRUD {
  static generateActions<M extends Model>(endpoint: string) {
    return {
      ...useStoreActions(),
      async axios_createItem(this: M, obj: M) {
				return new Promise((resolve, reject) => {
					api.post(`/${endpoint}`, obj, {
						headers: {
							/*Authorization: authenticationStore.getBearerToken*/
						}
					}).then((response) => {
						this.save(response.data)
						resolve(response)
					}), (error: any) => {
						reject(error)
					}
				})
			},
      async axios_getAll(this: M) {
        const response = await api.get(`/${endpoint}`, {
          headers: {/*Authorization: authenticationStore.getBearerToken*/},
          params: {}
        })
        this.fresh(response.data)
        return response
      },
      async axios_getId(this: M, id: number) {
        const response = await api.get(`/${endpoint}/${id}`, {
          headers: { /*Authorization: authenticationStore.getBearerToken*/},
          params: {}
        })
        this.save(response.data)
        return response
      },
      async axios_updateItem(this: M, obj: M) {
        if(obj.id == null) throw new Error("Axios Update Item must have ID")
        return new Promise((resolve, reject) => {
          api.patch(`/${endpoint}/${obj.id}`, obj, {
            /*headers: {
              Authorization: authenticationStore.getBearerToken
            }*/
          }).then((response) => {
            this.save(response.data)
            resolve(response)
          }, (error: any) => reject(error))
        })
      },
      async axios_deleteItem(this: M, id: number) {
        return new Promise((resolve, reject) => {
          api.delete(`/${endpoint}/${id}`, {
            /*headers: { Authorization: authenticationStore.getBearerToken } */
          }).then((response) => {
            this.destroy([id]);
            resolve(response)
          }, (error: any) => reject(error))
        })
      }
    }
  }
}