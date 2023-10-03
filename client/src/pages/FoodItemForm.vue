<script setup lang="ts">
import { FoodItem, useFoodItemStore } from 'src/stores/foodItem/foodItemStore'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const foodItemStore = useFoodItemStore()
const onSubmit = async () => {
  if (
    foodItemName.value === '' ||
    parseInt(foodItemCalories.value) < 1 ||
    foodItemUnit.value === ''
  )
    throw new Error('food item is incomplete in form')

  // todo: populate fooditem object to be submitted via api
  const newItem: FoodItem = {
    name: foodItemName.value,
    unit: foodItemUnit.value,
    caloriesPerUnit: parseInt(foodItemCalories.value),
  }
  await foodItemStore.createItem(newItem)
  router.push('food-items')
}
const onReset = () => {
  foodItemName.value = ''
  foodItemUnit.value = 'EA'
  foodItemCalories.value = ''
}

const foodItemName = ref<string>('')
const foodItemCalories = ref<string>('')
const foodItemUnit = ref<string>('EA')
</script>

<template>
  <div>
    <q-btn @click="onReset">RESET</q-btn>
    <q-btn @click="onSubmit">SUBMIT</q-btn>
    <h4>FOOD ITEM</h4>
    <q-input
      v-model="foodItemName"
      filled
      hide-selected
      fill-input
      input-debounce="20"
      label="Specify a Food Item"
    >
    </q-input>
    Unit
    <q-input v-model="foodItemUnit"></q-input>
    calories
    <q-input v-model="foodItemCalories"></q-input>
  </div>
</template>
