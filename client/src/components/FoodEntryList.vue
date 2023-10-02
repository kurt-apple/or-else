<script setup lang="ts">
import {
  FoodEntry,
  useFoodEntryStore,
} from 'src/stores/foodEntry/foodEntryStore'
import Utils from 'src/util'

export interface Props {
  title?: string
  logs?: Array<FoodEntry>
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Food Entries',
  logs: () => [],
})

const foodEntryStore = useFoodEntryStore()
</script>

<template>
  <div>
    <h1>{{ title }}</h1>
    <q-list>
      <q-item v-for="(h, index) in logs" :key="index">
        <q-item-section>
          <q-item-label>
            {{
              Utils.d(
                Utils.hardCheck(
                  foodEntryStore.dailyLog(h).logDate,
                  'daily log is undefined'
                )
              ).toLocaleDateString()
            }}
            - {{ h.qty }} x {{ foodEntryStore.foodItem(h)?.name }}</q-item-label
          >
        </q-item-section>
      </q-item>
    </q-list>
  </div>
</template>
