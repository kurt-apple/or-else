<script setup lang="ts">
import FoodEntryList from 'src/components/FoodEntryList.vue'
import { useDailyLogsStore } from 'src/stores/dailyLog/dailyLogStore'
import {
  FoodEntry,
  useFoodEntryStore,
} from 'src/stores/foodEntry/foodEntryStore'
import { useFoodItemStore } from 'src/stores/foodItem/foodItemStore'
import { useUsersStore } from 'src/stores/user/userStore'
import { ref } from 'vue'
import Utils from 'src/util'
import { useRouter } from 'vue-router'
const foodEntryStore = useFoodEntryStore()
const logs = ref<Array<FoodEntry>>([...foodEntryStore.getAll()])
const router = useRouter()
const todayOnly = ref(false)
const redirectToForm = () => {
  router.push('food-entry')
}
const addEntry = () => {
  const dailyLogStore = useDailyLogsStore()
  const userStore = useUsersStore()
  const user = userStore.gimmeUser()
  const latest = dailyLogStore.latestLog(user.id)
  const dailyLogID = latest.id
  if (typeof dailyLogID === 'undefined')
    throw new Error('no can do. daily log id is undefined.')
  const foodItems = useFoodItemStore().getAll()
  const selectedFoodItem = foodItems[Utils.randbetween(0, foodItems.length - 1)]
  const foodItemID = selectedFoodItem.id
  if (typeof foodItemID === 'undefined')
    throw new Error('no can do. food item id is undefined.')
  const dummyData: FoodEntry = {
    dailyLogID,
    foodItemID,
    qty: Utils.randbetween(1, 20),
  }
  foodEntryStore.createItem(dummyData)
}
</script>
<template>
  <q-page padding>
    today only?
    <q-checkbox v-model="todayOnly"></q-checkbox>
    <food-entry-list
      title="All Food Entries"
      :logs="todayOnly ? foodEntryStore.todayOnly() : foodEntryStore.getAll()"
    ></food-entry-list>
    <q-page-sticky position="bottom-right" :offset="[18, 18]">
      <q-btn fab icon="add" color="accent" @click="redirectToForm" />
    </q-page-sticky>
  </q-page>
</template>
