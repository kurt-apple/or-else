import { defineStore } from 'pinia'
import { PiniaGenerics, Record } from '../PiniaGenerics'
import { HasDailyLog, useDailyLogsStore } from '../dailyLog/dailyLogStore'
import Utils from 'src/util'
import { useAxiosStore } from '../axios-store'


export class WeightEntry extends Record implements HasDailyLog {
  id?: number = undefined
  dailyLogID?: number = undefined
  time = new Date().toLocaleDateString()
  weight = -1
}

export const useWeightEntryStore = defineStore('weight-entries', {
  ...PiniaGenerics.stateTree<WeightEntry>(),
  getters: {
    ...PiniaGenerics.generateStoreGetters<WeightEntry>(),
    // ...DailyLogGenerics.generateDailyLogGetters<WeightEntry>(),
    allItemsForDailyLog: (state) => (dailyLogID: number) => {
      if (state.items.length === 0) return []
      return state.items.filter((x) => x.dailyLogID === dailyLogID)
    },
    allItemsForUser: (state) => (userID?: number) => {
      if (typeof userID === 'undefined')
        throw new Error('cannot fetch anything with undefined id')
      const logStore = useDailyLogsStore()
      const logs = logStore.items
      const weightEntries: WeightEntry[] = []
      logs.forEach((x) =>
        weightEntries.push(...state.items.filter((y) => y.dailyLogID === x.id))
      )
      return weightEntries
    },
    latest: (state) => (): WeightEntry | null => {
      if (state.items.length === 0) return null
      return state.items.sort((a, b) => Utils.mdwe(a, b, 'desc'))[0]
    },
  },
  actions: {
    mapZeroToUndefined(item: WeightEntry) {
      if (item.dailyLogID === 0) item.dailyLogID = undefined
      return item
    },
    // todo: make these generic
    // problem is 'this' is possibly undefined
    async createItem(item: WeightEntry) {
      let newItem
      await useAxiosStore().axios()
        .post('/weight-entries', item, {
          headers: {},
          params: {},
        })
        .then((response) => {
          console.log('createItem response from backend: ', response)
          newItem = this.mapZeroToUndefined(response.data)
          if (this.items.length === 0) this.items = [newItem]
          else this.items.push(newItem)
        }, Utils.handleError('Error creating item.'))
    },
    async fetchAll() {
      const response = await useAxiosStore().axios().get('/weight-entries', {
        headers: {},
        params: {},
      })
      if(typeof response.data === 'undefined' || response.data === null || response.data === '') this.items = []
      else this.items = response.data
      for (let i = 0; i < this.items.length; i++) {
        this.items[i] = this.mapZeroToUndefined(this.items[i])
      }
    },
    async fetchItem(id: number) {
      const response = await useAxiosStore().axios().get(`/weight-entries/${id}`, {
        headers: {},
        params: {},
      })
      return this.mapZeroToUndefined(response.data)
    },
    async updateItem(item: WeightEntry) {
      const index = this.items.findIndex((x) => x.id === item.id)
      if (index !== -1) {
        await useAxiosStore().axios()
          .patch(`/weight-entries/${item.id}`, item, {
            headers: {},
          })
          .then((response) => {
            this.items[index] = { ...this.items[index], ...item }
            return response
          }, Utils.handleError('Error updating item.'))
      }
    },
    async deleteItem(id?: number) {
      if (typeof id === 'undefined')
        throw new Error('cannot delete undefined. skill issue lol')
      const index = this.items.findIndex((x) => x.id === id)
      if (index !== -1) {
        await useAxiosStore().axios()
          .delete(`/weight-entries/${id}`, {
            headers: {},
          })
          .then((response) => {
            this.items.splice(index, 1)
            return response
          }, Utils.handleError('Error deleting item.'))
      }
    },
  },
})
