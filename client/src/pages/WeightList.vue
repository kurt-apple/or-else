<script setup lang="ts">
import { useDailyLogsStore } from 'src/stores/dailyLog/dailyLogStore'
import {
  WeightEntry,
  useWeightEntryStore,
} from 'src/stores/weight-entry/weightEntryStore'
import Utils from 'src/util'
import { ref } from 'vue'
const weightEntryStore = useWeightEntryStore()
const latest = ref(weightEntryStore.latest())
const weight = ref<string>(
  latest.value === null ? '1' : latest.value.weight.toString()
)

const newEntry = async () => {
  console.log('weight: ', weight.value)
  if (parseInt(weight.value) < 1) throw new Error('weight value is not valid')
  const entry: WeightEntry = {
    dailyLogID: Utils.hardCheck(useDailyLogsStore().latestLog()).id,
    time: new Date().toISOString(),
    weight: parseInt(weight.value),
  }
  console.log('entry: ', entry)
  await weightEntryStore.createItem(entry)
}
</script>

<template>
  <q-input
    v-model="weight"
    bottom-slots
    label="Weigh-in"
    type="number"
    dense
    filled
    @keyup.enter="newEntry"
  >
    <template #hint> Quickly add a new weight entry here. </template>

    <template #after>
      <q-btn round dense flat icon="send" @click="newEntry" />
    </template>
  </q-input>
  <q-list>
    <q-item v-for="(w, i) in useWeightEntryStore().items" :key="i">
      {{
        Utils.d(w.time).toLocaleDateString() +
        ' ' +
        Utils.d(w.time).toLocaleTimeString()
      }}
      - {{ w.weight }} lbs
    </q-item>
  </q-list>
</template>
