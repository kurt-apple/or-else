<script setup lang="ts">
import { DailyLog, useDailyLogsStore } from 'src/stores/dailyLog/dailyLogStore'
import FoodEntryTreeNode from './FoodEntryTreeNode.vue'
import {
  FoodEntry,
  useFoodEntryStore,
} from 'src/stores/foodEntry/foodEntryStore'
import { computed, onMounted, ref } from 'vue'

export interface Props {
  title?: string
  logs?: Array<FoodEntry>
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Food Entries',
  logs: () => [],
})

const foodEntryStore = useFoodEntryStore()
const dailyLogStore = useDailyLogsStore()

const generateLogLabel = (log: DailyLog) => {
  return (
    new Date(log.logDate).toLocaleDateString() +
    ': ' +
    dailyLogStore.totalCaloriesConsumed(log.id) +
    ' / ' +
    dailyLogStore.calculateActualRation(log)
  )
}

const treePayload = computed(() => {
  return dailyLogStore.allDesc().map((x) => ({
    label: generateLogLabel(x),
    type: 'date',
    obj: x,
    children: foodEntryStore.allItemsForDailyLog(x.id).map((y: FoodEntry) => ({
      label:
        foodEntryStore.foodItem(y).name +
        ' - ' +
        foodEntryStore.totalCalories(y) +
        ' Calories',
      type: 'food-log',
      obj: y,
    })),
  }))
})

console.log(treePayload)

const toExpand = generateLogLabel(dailyLogStore.allDesc()[0])
const expanded = ref([toExpand])
</script>

<template>
  <div>
    <h1>{{ title }}</h1>
    <q-tree
      ref="tree"
      v-model:expanded="expanded"
      :nodes="treePayload"
      node-key="label"
    >
      <template #default-header="prop">
        <q-item-label v-if="prop.node.type === 'date'">{{
          prop.node.label
        }}</q-item-label>
        <food-entry-tree-node
          v-if="prop.node.type === 'food-log'"
          :entry="prop.node.obj"
        />
      </template>
    </q-tree>
  </div>
</template>
