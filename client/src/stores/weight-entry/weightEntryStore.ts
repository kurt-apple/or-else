import { defineStore } from 'pinia'
import { PiniaGenerics, Record } from '../PiniaGenerics'
import { HasDailyLog, useDailyLogsStore } from '../dailyLog/dailyLogStore'
import Utils from 'src/util'
import { api } from 'src/boot/axios'

export class WeightEntry extends Record implements HasDailyLog {
  id?: number | undefined
  dailyLogID = -1
  time = new Date()
  weight = -1

  getID(): number {
    throw new Error('Method not implemented')
  }
}

export const useWeightEntryStore = defineStore('weight-entries', {
  ...PiniaGenerics.stateTree<WeightEntry>(),
  getters: {
    ...PiniaGenerics.generateStoreGetters<WeightEntry>(),
    // ...DailyLogGenerics.generateDailyLogGetters<WeightEntry>(),
    allItemsForDailyLog: (state) => (dailyLogID: number) => {
      return state.items.filter((x) => x.dailyLogID === dailyLogID)
    },
    allItemsForUser: (state) => (userID?: number) => {
      if (typeof userID === 'undefined')
        throw new Error('cannot fetch anything with undefined id')
      const logStore = useDailyLogsStore()
      const logs = logStore.allItemsForUser(userID)
      const weightEntries: WeightEntry[] = []
      logs.forEach((x) =>
        weightEntries.push(...state.items.filter((y) => y.dailyLogID === x.id))
      )
      return weightEntries
    },
  },
  actions: {
    // todo: make these generic
    // problem is 'this' is possibly undefined
    async createItem(item: WeightEntry) {
      let newItem
      await api
        .post('/weight-entries', item, {
          headers: {},
          params: {},
        })
        .then((response) => {
          console.log('createItem response from backend: ', response)
          newItem = response.data
          this.items.push(newItem)
        }, Utils.handleError('Error creating item.'))
    },
    async fetchAll() {
      const response = await api.get('/weight-entries', {
        headers: {},
        params: {},
      })
      this.items = response.data
    },
    async fetchItem(id: number) {
      const response = await api.get(`/weight-entries/${id}`, {
        headers: {},
        params: {},
      })
      return response.data
    },
    async updateItem(item: WeightEntry) {
      const index = this.items.findIndex((x) => x.id === item.id)
      if (index !== -1) {
        await api
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
        await api
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
