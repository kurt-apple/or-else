import { defineStore } from 'pinia'
import { PiniaGenerics, Record } from '../PiniaGenerics'
import { FoodEntry, useFoodEntryStore } from '../foodEntry/foodEntryStore'
import { api } from 'src/boot/axios'
import Utils from 'src/util'

export class FoodItem extends Record {
  id?: number = undefined
  name = 'Unnamed Food Item'
  unit = 'piece'
  caloriesPerUnit = 0

  static defaults() {
    const newItem: FoodItem = {
      name: 'Unnamed Food Item',
      unit: 'EA',
      caloriesPerUnit: 100,
    }
    return newItem
  }
}

export interface HasFoodItem extends Record {
  foodItemID?: number
}

export const useFoodItemStore = defineStore('food-item', {
  ...PiniaGenerics.stateTree<FoodItem>(),
  getters: {
    ...PiniaGenerics.generateStoreGetters<FoodItem>(),
    getRelatedFoodEntries:
      () =>
      (foodItemID?: number): FoodEntry[] => {
        if (typeof foodItemID === 'undefined')
          throw new Error('foodItemID is not known')
        const foodEntryStore = useFoodEntryStore()
        const allLogEntries =
          foodEntryStore.allFoodLogEntriesForFoodItem(foodItemID)
        return allLogEntries
      },
  },
  actions: {
    top3mostCommon() {
      const records = this.items
        .map((x) => ({
          obj: x,
          entries: this.getRelatedFoodEntries(x.id).length,
        }))
        .sort((a, b) => b.entries - a.entries)
      return records.slice(0, 3).map((x) => x.obj)
    },
    mostCommonQuantities(item: FoodItem) {
      const relatedEntries = this.getRelatedFoodEntries(item.id)
      // todo: de-GPT this code to become l33t
      const quantitiesOfQuantities: Map<number, number> = new Map()
      relatedEntries.forEach((entry) => {
        quantitiesOfQuantities.set(
          entry.qty,
          (quantitiesOfQuantities.get(entry.qty) || 0) + 1
        )
      })
      const sortedQuantities = Array.from(quantitiesOfQuantities.keys()).sort(
        (a, b) =>
          quantitiesOfQuantities.get(b)! - quantitiesOfQuantities.get(a)!
      )
      return sortedQuantities.slice(0, 3)
    },
    // todo: make these generic
    // problem is 'this' is possibly undefined
    async createItem(item: FoodItem) {
      let newItem
      await api
        .post('/food-items', item, {
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
      const response = await api.get('/food-items', {
        headers: {},
        params: {},
      })
      this.items = response.data
    },
    async fetchItem(id: number) {
      const response = await api.get(`/food-items/${id}`, {
        headers: {},
        params: {},
      })
      return response.data
    },
    async updateItem(item: FoodItem) {
      const index = this.items.findIndex((x) => x.id === item.id)
      if (index !== -1) {
        await api
          .patch(`/food-items/${item.id}`, item, {
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
          .delete(`/food-items/${id}`, {
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
