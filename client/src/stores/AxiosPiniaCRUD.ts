import { api } from 'src/boot/axios'
import { Record, State } from './PiniaGenerics'
import { StoreDefinition } from 'pinia'

export default class AxiosPiniaCRUD {
  static generateActions<M extends Record>(this: StoreDefinition, endpoint: string) {
    return {
      async axios_createItem(this: M, obj: M) {
        console.log("createItem: ", obj)
        return new Promise((resolve, reject) => {
          api
            .post(`/${endpoint}`, obj, {
              headers: {
                /*Authorization: authenticationStore.getBearerToken*/
              },
            })
            .then((response) => {
              console.log("createItem response from backend: ", response)
              //todo: does this actually save to the repo?
              
              resolve(response)
            }),
            (error: any) => {
              console.log("there was an error creating the item: ", error)
              reject(error)
            }
        })
      },
      async fetchAll() {
        const response = await api.get(`/${endpoint}`, {
          headers: {
            /*Authorization: authenticationStore.getBearerToken*/
          },
          params: {},
        })
        //console.log(`debug axios getAll (${endpoint}): `, response.data ? response.data[0] : 'response.data is null', ` and ${response.data.length - 1} more`)
        //todo: how to replace this.fresh with this.items = blah? How to define `this` here?
        state.items = response.data
        //return response
        
      },
      async axios_getID(this: M, id: number) {
        const response = await api.get(`/${endpoint}/${id}`, {
          headers: {
            /*Authorization: authenticationStore.getBearerToken*/
          },
          params: {},
        })
        this.save(response.data)
        return response.data
      },
      async axios_updateItem(this: M, obj: M) {
        if (obj.id == null) throw new Error('Axios Update Item must have ID')
        return new Promise((resolve, reject) => {
          api
            .patch(`/${endpoint}/${obj.id}`, obj, {
              /*headers: {
              Authorization: authenticationStore.getBearerToken
            }*/
            })
            .then(
              (response) => {
                this.save(response.data)
                resolve(response)
              },
              (error: any) => reject(error)
            )
        })
      },
      async axios_deleteItem(this: M, id: number) {
        return new Promise((resolve, reject) => {
          api
            .delete(`/${endpoint}/${id}`, {
              /*headers: { Authorization: authenticationStore.getBearerToken } */
            })
            .then(
              (response) => {
                this.destroy([id])
                resolve(response)
              },
              (error: any) => reject(error)
            )
        })
      },
    }
  }
}
