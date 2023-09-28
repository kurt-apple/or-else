<script setup lang="ts">
import CompletionsPage from 'src/pages/CompletionsPage.vue'
import { useDailyLogsStore } from 'src/stores/dailyLog/dailyLogStore'
import {
  CompletionEntry,
  useCompletionsStore,
} from 'src/stores/completion/completionStore'
import { computed, ref } from 'vue'

const dailyLogStore = useDailyLogsStore()
const completionStore = useCompletionsStore()

export interface Props {
  title?: string
  completionEntries?: Array<CompletionEntry>
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Completion Entries',
  completionEntries: () => [],
})

const editModeToggle = ref(false)

const latestLog = computed(() => dailyLogStore.latestLog())

const dateOf = computed((completion: CompletionEntry) =>
  completionStore.dateValueFromDailyLog(completion.id)
)

const deleteEntry = async (entry: CompletionEntry) => {
  console.log('delete item id: ', entry.id)
  let result
  if (entry.id != null) {
    result = await completionStore.deleteItem(entry.id)
    console.log('result: ', result)
  }
}

const toggleEditMode = () => {
  editModeToggle.value = !editModeToggle.value
}

const updateCompletedStatus = async (r: CompletionEntry) => {
  const result = await completionStore.updateItem(r)
  console.log(`#${r.id} status is now ${r.status} - api result: `, result)
  const dateOf = completionStore.dateValueFromDailyLog(r.id)
  await dailyLogStore.reSampleHabitsGivenDate(dateOf)
}
</script>

<template>
  <div>
    <h1>{{ title }}</h1>
    <q-btn
      :icon="editModeToggle ? 'visibility' : 'edit'"
      @click="toggleEditMode"
    ></q-btn>
    <q-list v-if="!editModeToggle">
      <q-item v-for="(h, index) in completionEntries" :key="index">
        <q-checkbox
          v-model="h.status"
          :indeterminate-value="0"
          :true-value="2"
          :false-value="1"
          indeterminate-icon="check_box_outline_blank"
          @click="updateCompletedStatus(h)"
        ></q-checkbox>
        <q-item-section>
          <q-item-label>
            {{
              completionStore.getHabit(h)?.title
                ? completionStore.getHabit(h)?.title
                : 'undefined'
            }}
          </q-item-label>
        </q-item-section>
        <q-item-section>
          <q-item-label>
            {{
              completionStore.dateValueFromDailyLog(h.id).toLocaleDateString()
                ? completionStore
                    .dateValueFromDailyLog(h.id)
                    .toLocaleDateString()
                : 'undefined'
            }}</q-item-label
          >
        </q-item-section>
      </q-item>
    </q-list>
    <q-list v-else>
      <q-item v-for="(h, index) in completionEntries" :key="index">
        <q-item-section>
          {{ h.status }}
        </q-item-section>
        <q-item-section>
          <q-item-label>
            edit mode: {{ h.habit?.title || 'reeeee' }}</q-item-label
          >
        </q-item-section>
        <q-item-section>
          <q-item-label> {{ h.dailyLog.logDate || 'reeee' }}</q-item-label>
        </q-item-section>
        <q-item-section>
          <q-btn icon="delete" color="negative" @click="deleteEntry(h)" />
        </q-item-section>
      </q-item>
    </q-list>
  </div>
</template>
