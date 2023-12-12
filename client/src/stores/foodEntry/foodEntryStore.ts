import { defineStore } from 'pinia'
import { PiniaGenerics, Record } from '../PiniaGenerics'
import { HasDailyLog, useDailyLogsStore } from '../dailyLog/dailyLogStore'
import { api } from 'src/boot/axios'
import Utils from 'src/util'
import { HasFoodItem, useFoodItemStore } from '../foodItem/foodItemStore'

export class FoodEntry extends Record implements HasDailyLog, HasFoodItem {
  id?: number = undefined
  dailyLogID?: number = undefined
  foodItemID?: number = undefined
  qty = 0
}

export const useFoodEntryStore = defineStore('food-entry', {
  ...PiniaGenerics.stateTree<FoodEntry>(),
  getters: {
    ...PiniaGenerics.generateStoreGetters<FoodEntry>(),
    // ...DailyLogGenerics.generateDailyLogGetters<FoodEntry>(),
    // ...FoodItemGenerics.generateFoodItemGetters<FoodEntry>(),
    allFoodLogEntriesForFoodItem:
      (state) =>
      (foodItemID?: number): FoodEntry[] => {
        if (typeof foodItemID === 'undefined')
          throw new Error('food item id is undefined')
        if (state.items.length === 0) return []
        return state.items.filter((x) => x.foodItemID === foodItemID)
      },
    foodItem: () => (entry: FoodEntry) => {
      const foodItemStore = useFoodItemStore()
      const item = Utils.hardCheck(
        foodItemStore.getByID(entry.foodItemID),
        'could not find food item by id from food entry.'
      )
      return item
    },
    allItemsForDailyLog: (state) => (dailyLogID?: number | undefined) => {
      if (state.items.length === 0) return []
      return state.items.filter((x) => x.dailyLogID === dailyLogID)
    },
    dailyLog: () => (item: FoodEntry) => {
      const dailyLogStore = useDailyLogsStore()
      return Utils.hardCheck(
        dailyLogStore.getByID(item.dailyLogID),
        'could not find daily log for provided daily log id of food entry'
      )
    },
    todayOnly: (state) => () => {
      if (state.items.length === 0) return []
      const latestLog = useDailyLogsStore().latestLog()
      return state.items.filter((x) => x.dailyLogID === latestLog.id)
    },
  },
  actions: {
    totalCalories(entry: FoodEntry) {
      return entry.qty * this.foodItem(entry).caloriesPerUnit
    },
    // todo: make these generic
    // problem is 'this' is possibly undefined
    async createItem(item: FoodEntry) {
      let newItem
      await api
        .post('/food-entries', item, {
          headers: {},
          params: {},
        })
        .then((response) => {
          console.log('create food entry response from backend: ', response)
          newItem = this.mapZeroToUndefined(response.data)
          if (this.items.length === 0) this.items = []
          this.items.push(newItem)
        }, Utils.handleError('Error creating item.'))
    },
    mapZeroToUndefined(item: FoodEntry): FoodEntry {
      if (item.dailyLogID === 0) item.dailyLogID = undefined
      if (item.foodItemID === 0) item.foodItemID = undefined
      return item
    },
    async fetchAll() {
      const response = await api.get('/food-entries', {
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
      const response = await api.get(`/food-entries/${id}`, {
        headers: {},
        params: {},
      })
      return response.data
    },
    async updateItem(item: FoodEntry) {
      const index = this.items.findIndex((x) => x.id === item.id)
      if (index !== -1) {
        await api
          .patch(`/food-entries/${item.id}`, item, {
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
          .delete(`/food-entries/${id}`, {
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
