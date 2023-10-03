<script setup lang="ts">
import { useDailyLogsStore } from 'src/stores/dailyLog/dailyLogStore'
import { useHabitsStore } from 'src/stores/habit/habitStore'
import { ref } from 'vue'
const dailyLogStore = useDailyLogsStore()
const habitsStore = useHabitsStore()
const dailyLogs = dailyLogStore.items.map((x) => ({
  label: new Date(x.logDate).toLocaleDateString(),
  children: dailyLogStore.getCompletionEntries(x.id).map((y) => ({
    label:
      y.habitID.toString() +
      ': ' +
      habitsStore.getByID(y.habitID)?.title +
      ': ' +
      (y.status === 2 ? 'COMPLETED' : 'INCOMPLETE'),
  })),
}))
const payload = ref(dailyLogs)
</script>

<template>
  <q-page>
    <h4>Completion Entries</h4>
    <q-tree :nodes="payload" node-key="label"> </q-tree>
  </q-page>
</template>
