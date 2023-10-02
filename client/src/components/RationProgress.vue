<script setup lang="ts">
import { useDailyLogsStore } from 'src/stores/dailyLog/dailyLogStore'
import { computed, ref } from 'vue'

const dailyLogStore = useDailyLogsStore()

const latestLog = dailyLogStore.latestLog()

const rationProgress = ref(dailyLogStore.rationProgress(latestLog) * 100)

const barColor = computed(() => {
  console.log('ration progress is ', rationProgress.value)
  const color = rationProgress.value >= 100 ? 'red' : 'green'
  console.log(color)
  return color
})
</script>

<template>
  <q-knob
    v-model="rationProgress"
    size="300px"
    :color="barColor"
    class="q-ma-md"
  />
</template>
