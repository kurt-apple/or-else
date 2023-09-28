<script setup lang="ts">
import { useCompletionsStore } from 'src/stores/completion/completionStore'
import { DailyLog, useDailyLogsStore } from 'src/stores/dailyLog/dailyLogStore'
import Utils from 'src/util'
import { ref } from 'vue'

export interface Props {
  title?: string
  logs?: Array<DailyLog>
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Daily Logs',
  logs: () => [],
})

const editModeToggle = ref(false)

const toggleEditMode = () => (editModeToggle.value = !editModeToggle.value)

const dailyLogStore = useDailyLogsStore()

const completionStore = useCompletionsStore()
</script>

<template>
  <div>
    <h1>{{ title }}</h1>
    <q-btn
      :icon="editModeToggle ? 'visibility' : 'edit'"
      @click="toggleEditMode"
    ></q-btn>
    <q-list v-if="!editModeToggle">
      <q-item v-for="(h, index) in logs" :key="index">
        <q-item-section>
          <q-item-label>
            {{ Utils.d(h.logDate).toLocaleDateString() }}</q-item-label
          >
        </q-item-section>
        <q-item-section>
          <q-item-label>
            completion entries:
            {{
              h.completionEntries ? h.completionEntries.length : 0
            }}</q-item-label
          >
        </q-item-section>
        <q-item-section>
          <q-item-label>
            sample size: {{ dailyLogStore.sampleRate(h.id) }}</q-item-label
          >
        </q-item-section>
        <q-item-section>
          <q-item-label>
            done: {{ dailyLogStore.qtyImprovedHabits(h.id) }}</q-item-label
          >
        </q-item-section>
      </q-item>
    </q-list>
    <q-list v-else>
      <q-item v-for="(h, index) in logs" :key="index">
        <q-item-section>
          <q-item-label> edit mode: {{ h.logDate }}</q-item-label>
        </q-item-section>
        <q-item-section>
          <q-item-label>
            {{ completionStore.allItemsForDailyLog(h.id).length }}</q-item-label
          >
        </q-item-section>
        <q-item-section>
          <q-btn
            icon="delete"
            color="negative"
            @click="dailyLogStore.deleteItem(h.id)"
          />
        </q-item-section>
      </q-item>
    </q-list>
  </div>
</template>
