import { defineStore } from 'pinia'

export abstract class Record {
  id?: number
  constructor(options: Record) {
    Object.assign(this, options)
  }
  // getID() {
  //   return Utils.hardCheck(this.id, 'User does not have ID yet')
  // }
}

export interface State<R extends Record> {
  items: R[]
}
export class PiniaGenerics {
  static getByID<R extends Record>(state: State<R>, id: number) {
    return state.items.find((x) => x.id === id)
  }
  static generateStoreGetters<R extends Record>() {
    return {
      getByID: (state: State<R>) => (id: number) => {
        return this.getByID<R>(state, id)
      },
      getAll: (state: State<R>) => (): R[] => {
        return state.items
      },
    }
  }
  static stateTree<R extends Record>() {
    return {
      state: (): State<R> => {
        return {
          items: [],
        }
      },
    }
  }
  //todo: this seems to be the right direction however trouble since 'this' will be undefined.
  //other option is to wrap the defineStore method however I ran into issues where R wasn't the right shape
  /*static generateStoreActions<R extends Record>(
    endpoint: string, 
    fresh: (items: R[]) => void,
    push: (item: R) => void,
    update: (index: number, item: R) => void,
    remove: (id: number) => void
  ) {
    return {
      async createItem(item: R) {
        await api.post(`/${endpoint}`, item, {
          headers: {},
          params: {}
        }).then((response) => {
          console.log('successful create item', response)
          fresh(response.data)
        }), Utils.handleError('Error creating item.')
      }
    }
  }*/
  static defineStoreCustom<R extends Record>(name: string) {
    return defineStore(name, {
      ...PiniaGenerics.stateTree<R>(),
      // todo: and here's where it gets tricky.
      // getters: {
      //   ...PiniaGenerics.generateStoreGetters<R>()
      // }
    })
  }
}
