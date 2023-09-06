import { Model, useStoreActions } from 'pinia-orm';
import AxiosModel from './axios-model';
import { api } from 'src/boot/axios';

export default class AxiosPiniaOptions {
  static getPiniaOptions() {
    return {
      ...useStoreActions(),
			async axios_createItem(this: AxiosModel & Model, obj: AxiosModel & Model) {
				return new Promise((resolve, reject) => {
					///TODO: does this technically mean any AxiosModel could be passed as argument into any other AxiosModel's actions?
					api.post(`/${this.entity}`, obj, {
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
      async axios_getAll(this: AxiosModel & Model) {
				console.log({'entity name': this.entity})
        const response = await api.get(`/${this.entity}`, {
					headers: {/*Authorization: authenticationStore.getBearerToken*/},
					params: {}
				})
				console.log({'response data': response.data})
				this.fresh(response.data)
				return response
      },
			async axios_getId(this: AxiosModel & Model, id: number) {
				const response = await api.get(`/${this.entity}/${id}`, {
					headers: { /*Authorization: authenticationStore.getBearerToken*/},
					params: {}
				})
				this.save(response.data)
				return response
			},
      async axios_updateItem(this: AxiosModel & Model, obj: AxiosModel & Model) {
				if(obj.id == null) throw new Error("Axios Update Item must have ID")
        return new Promise((resolve, reject) => {
					api.patch(`/${this.entity}/${obj.id}`, obj, {
						/*headers: {
							Authorization: authenticationStore.getBearerToken
						}*/
					}).then((response) => {
						this.save(response.data)
						resolve(response)
					}, (error: any) => reject(error))
				})
      },
			async axios_deleteItem(this: AxiosModel & Model, id: number) {
				return new Promise((resolve, reject) => {
					api.delete(`/${this.entity}/${id}`, {
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