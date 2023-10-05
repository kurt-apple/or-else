<script setup lang="ts">
import { useDailyLogsStore } from 'src/stores/dailyLog/dailyLogStore'
import {
  FoodEntry,
  useFoodEntryStore,
} from 'src/stores/foodEntry/foodEntryStore'
import { FoodItem, useFoodItemStore } from 'src/stores/foodItem/foodItemStore'
import Utils from 'src/util'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const foodEntryStore = useFoodEntryStore()
const foodItemStore = useFoodItemStore()
const dailyLogStore = useDailyLogsStore()
const onSubmit = async () => {
  if (
    selectedFoodItem.value === null ||
    typeof selectedFoodItem.value === 'undefined'
  )
    throw new Error('selected food item is incomplete in form')
  if (foodEntryDate.value === '')
    throw new Error(
      'todo: validate more;\n meanwhile, date input is empty and that is bad'
    )
  const log = Utils.hardCheck(
    dailyLogStore.queryDate(foodEntryDate.value),
    'could not locate daily log'
  )
  const logID = Utils.hardCheck(
    log.id,
    'log with provided date, if it exists, has no ID'
  )
  // todo: kick off a dialog to create the daily log if it doesn't exist yet
  // todo: fetch id of daily log for given date
  // todo: have some way to add a new food item if entered in input field
  const foodItemID = Utils.hardCheck(
    selectedFoodItem.value.id,
    'food item has no value'
  )
  // todo: populate FoodEntry object to be submitted via api
  const entry: FoodEntry = {
    dailyLogID: logID,
    foodItemID,
    qty: qtyInput.value,
  }
  await foodEntryStore.createItem(entry)
  router.push('food-logs')
}
const onReset = () => {
  foodEntryDate.value = new Date().toDateString()
  selectedFoodItem.value = null
  qtyInput.value = 1
}
const getUnit = computed(() => {
  if (
    typeof selectedFoodItem.value === 'undefined' ||
    selectedFoodItem.value === null
  )
    return ''
  else {
    return selectedFoodItem.value.unit
  }
})

const foodEntryDate = ref<string>(new Date().toDateString())
const selectedFoodItem = ref<FoodItem | null>(null)
const allFoodOptions = foodItemStore.getAll()
console.log('food items: ', allFoodOptions)
const foodOptions = ref(allFoodOptions)
console.log('ref value: ', foodOptions.value)
const qtyInput = ref(1)

// todo: figure out if & how the api docs make sense
// thank you Berichtsheft for concise type info on this piece of quasar api
type voidFn = () => void
type doneFn = (a: voidFn) => void

const filterSelection = (val: string, update: doneFn) => {
  update(() => {
    if (val === '') {
      foodOptions.value = allFoodOptions
    } else {
      const query = val.toLowerCase()
      foodOptions.value = allFoodOptions.filter((x) => {
        return x.name.toLowerCase().includes(query)
      })
    }
  })
}

const topFoods = ref<FoodItem[]>(foodItemStore.top3mostCommon())
const setFoodItem = (item: FoodItem) => {
  selectedFoodItem.value = item
}
const topQuantities = computed(() => {
  if (
    selectedFoodItem.value === null ||
    typeof selectedFoodItem.value === 'undefined'
  )
    return []
  return foodItemStore.mostCommonQuantities(selectedFoodItem.value)
})
const setQuantity = (qty: number) => {
  qtyInput.value = qty
}
</script>

<template>
  <div>
    <q-btn @click="onReset">RESET</q-btn>
    <q-btn @click="onSubmit">SUBMIT</q-btn>
    <h4>ENTRY DATE</h4>
    <q-date v-model="foodEntryDate" minimal />
    <h4>FOOD ITEM</h4>
    <q-select
      v-model="selectedFoodItem"
      filled
      hide-selected
      fill-input
      input-debounce="20"
      :options="foodOptions"
      option-label="name"
      map-options
      emit-value
      label="Specify a Food Item"
      use-input
      @filter="filterSelection"
    >
      <template #no-option>
        <q-item>
          <q-item-section class="text-red"> No results </q-item-section>
        </q-item>
      </template>
    </q-select>
    Top 3 Most Common Foods:
    <q-list>
      <q-item v-for="(item, index) in topFoods" :key="index">
        <q-btn @click="setFoodItem(item)">{{ item.name }}</q-btn>
      </q-item>
    </q-list>
    <h4>QUANTITY</h4>
    <q-item-label v-if="getUnit"
      >{{ selectedFoodItem?.name }} uses {{ getUnit }} as its unit of
      measure.</q-item-label
    >
    <q-input
      v-model.number="qtyInput"
      type="number"
      filled
      :rules="[(val) => val > 0 || 'A positive quantity is required']"
    />
    <div v-if="selectedFoodItem && topQuantities.length > 0">
      Most Common Quantities For {{ selectedFoodItem?.name }}:
      <q-list>
        <q-item v-for="(item, index) in topQuantities" :key="index">
          <q-btn @click="setQuantity(item)"
            >{{ item }} {{ selectedFoodItem?.unit }}(s)</q-btn
          >
        </q-item>
      </q-list>
    </div>
  </div>
</template>
