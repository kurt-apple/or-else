import { defineStore } from 'pinia'
import { PiniaGenerics, Record } from '../PiniaGenerics'
import { useFoodEntryStore } from '../foodEntry/foodEntryStore'

export class FoodItem extends Record {
  id?: number | undefined
  name = 'Unnamed Food Item'
  unit = 'piece'
  caloriesPerUnit = 0
}

export interface HasFoodItem extends Record {
  foodItemID: number
}

export const useFoodItemStore = defineStore('food-item', {
  ...PiniaGenerics.stateTree<FoodItem>(),
  getters: {
    ...PiniaGenerics.generateStoreGetters<FoodItem>(),
    getRelatedFoodEntries: () => (foodItemID?: number) => {
      if (typeof foodItemID === 'undefined')
        throw new Error('foodItemID is not known')
      const foodEntryStore = useFoodEntryStore()
      return foodEntryStore.allFoodLogEntriesForFoodItem(foodItemID)
    },
  },
})
