import { defineStore } from 'pinia'
import { PiniaGenerics, Record } from '../PiniaGenerics'
import { DailyLogGenerics, HasDailyLog } from '../dailyLog/dailyLogStore'
import { api } from '@/boot/axios'
import Utils from '@/util'
import { HasFoodItem, useFoodItemStore } from '../foodItem/foodItemStore'

export class FoodEntry extends Record implements HasDailyLog, HasFoodItem {
  id?: number | undefined
  dailyLogID = -1
  foodItemID = -1
  qty = 0
}

export const useFoodEntryStore = defineStore('food-entry', {
  ...PiniaGenerics.stateTree<FoodEntry>(),
  getters: {
    ...PiniaGenerics.generateStoreGetters<FoodEntry>(),
    ...DailyLogGenerics.generateDailyLogGetters<FoodEntry>(),
    // ...FoodItemGenerics.generateFoodItemGetters<FoodEntry>(),
    allFoodLogEntriesForFoodItem: (state) => (foodItemID?: number) => {
      if (typeof foodItemID === 'undefined')
        throw new Error('food item id is undefined')
      return state.items.filter((x) => x.foodItemID === foodItemID)
    },
    foodItemForFoodEntry: () => (entry: FoodEntry) => {
      const foodItemStore = useFoodItemStore()
      return foodItemStore.getByID(entry.foodItemID)
    },
  },
  actions: {
    totalCalories(entry: FoodEntry) {
      const item = Utils.hardCheck(
        this.foodItemForFoodEntry(entry),
        'could not find the food item for food entry'
      )
      return entry.qty * item.caloriesPerUnit
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
          console.log('createItem response from backend: ', response)
          newItem = response.data
          this.items.push(newItem)
        }, Utils.handleError('Error creating item.'))
    },
    async fetchAll() {
      const response = await api.get('/food-entries', {
        headers: {},
        params: {},
      })
      this.items = response.data
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
