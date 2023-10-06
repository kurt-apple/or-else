<script setup lang="ts">
import { useDailyLogsStore } from 'src/stores/dailyLog/dailyLogStore'
import { useUsersStore } from 'src/stores/user/userStore'
import {
  WeightEntry,
  useWeightEntryStore,
} from 'src/stores/weight-entry/weightEntryStore'
import { ref } from 'vue'
const weightEntryStore = useWeightEntryStore()
const weight = ref<string>(weightEntryStore.latest().weight.toString())

const newEntry = async () => {
  console.log('weight: ', weight.value)
  if (parseInt(weight.value) < 1) throw new Error('weight value is not valid')
  const entry: WeightEntry = {
    dailyLogID: useDailyLogsStore().latestLog().id,
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
    <q-item v-for="(w, i) in useWeightEntryStore().getAll()" :key="i">
      {{ w.time }} - {{ w.weight }}
    </q-item>
  </q-list>
</template>
