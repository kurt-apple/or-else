<script setup lang="ts">
import { useDailyLogsStore } from 'src/stores/dailyLog/dailyLogStore'
import { computed, ref } from 'vue'

const dailyLogStore = useDailyLogsStore()

const latestLog = dailyLogStore.latestLog()

const rationProgress = ref(
  Math.round(dailyLogStore.rationProgress(latestLog) * 100)
)

const barColor = computed(() => {
  const color = rationProgress.value >= 100 ? 'red' : 'green'
  return color
})
</script>

<template>
  <q-knob
    v-if="rationProgress"
    v-model="rationProgress"
    show-value
    size="300px"
    :color="barColor"
    center-color="grey"
    track-color="black"
    class="q-ma-md"
    readonly
    >{{ rationProgress }}%</q-knob
  >
  <h4 v-else>No Food Logs Yet Today</h4>
  <q-item-label
    >Ration: {{ dailyLogStore.calculateActualRation(latestLog) }}</q-item-label
  >
  <q-item-label
    >Used: {{ dailyLogStore.totalCaloriesConsumed(latestLog.id) }}</q-item-label
  >
</template>
