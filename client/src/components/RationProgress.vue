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
</template>
