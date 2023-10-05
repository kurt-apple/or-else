<script setup lang="ts">
import {
  FoodEntry,
  useFoodEntryStore,
} from 'src/stores/foodEntry/foodEntryStore'
import Utils from 'src/util'
import { computed, ref } from 'vue'

const foodEntryStore = useFoodEntryStore()

export interface Props {
  entry: FoodEntry | null
}

const props = withDefaults(defineProps<Props>(), {
  entry: null,
})

const e = ref<FoodEntry>(
  Utils.hardCheck(props.entry as FoodEntry, 'food entry is undefined or null')
)

const foodItem = computed(() => {
  return foodEntryStore.foodItem(e.value)
})
</script>
<template>
  <q-item-section>
    {{ foodItem.name }}
  </q-item-section>
  <q-item-section> QTY: {{ e.qty }} {{ foodItem.unit }} </q-item-section>
  <q-item-section>
    Calories: {{ foodEntryStore.totalCalories(e) }}
  </q-item-section>
</template>
