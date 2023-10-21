<script setup lang="ts">
import { DailyLog, useDailyLogsStore } from 'src/stores/dailyLog/dailyLogStore'
import Utils from 'src/util'
import { ref } from 'vue'

const dailyLogStore = useDailyLogsStore()

export interface Props {
  log?: DailyLog
}

const props = withDefaults(defineProps<Props>(), {
  log: undefined,
})

const log = ref<DailyLog>(
  Utils.hardCheck(props.log as DailyLog, 'daily log is undefined or null')
)

const del = async (log: DailyLog) => {
  const previousLogID = log.previousLogID
  const nextLog = dailyLogStore.nextLog(log)
  await dailyLogStore.deleteItem(log.id)
  if (typeof nextLog === 'undefined') return
  nextLog.previousLogID = previousLogID
}
</script>
<template>
  <q-item-label>{{ 'id: ' + log.id + ' - ' }}</q-item-label>
  <q-item-section>
    <q-item-label>
      {{ 'previouslogid: ' + log.previousLogID + ', ' }}
    </q-item-label>
  </q-item-section>
  <q-item-section>
    <q-item-label>
      {{ Utils.d(log.logDate).toLocaleDateString() }}</q-item-label
    >
  </q-item-section>
  <q-item-section>
    <q-item-label>
      base ration:
      {{ dailyLogStore.calculateBaseRation(log) }}
    </q-item-label>
  </q-item-section>
  <q-item-section>
    <q-item-label>
      ration:
      {{ dailyLogStore.calculateActualRation(log) }}</q-item-label
    >
  </q-item-section>
  <q-item-section>
    <q-item-label>
      consumed: {{ dailyLogStore.totalCaloriesConsumed(log.id) }}
    </q-item-label>
  </q-item-section>
  <q-item-section>
    <q-item-label> sampled {{ dailyLogStore.sampleRate(log.id) }}</q-item-label>
  </q-item-section>
  <q-item-section>
    <q-item-label> done: {{ dailyLogStore.countCompleted(log) }}</q-item-label>
  </q-item-section>
  <q-item-section>
    <q-item-label>
      completed
      {{ Math.round(dailyLogStore.successRate(log) * 100) + '%' }}
    </q-item-label>
  </q-item-section>
  <q-item-section>
    <q-item-label> {{ dailyLogStore.maxWeight(log) }} lbs </q-item-label>
  </q-item-section>
  <q-item-section>
    <q-btn icon="delete" color="red" @click="del(log)" />
  </q-item-section>
</template>
