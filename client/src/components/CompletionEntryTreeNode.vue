<script setup lang="ts">
import {
  CompletionEntry,
  useCompletionsStore,
} from 'src/stores/completion/completionStore'
import { DailyLog, useDailyLogsStore } from 'src/stores/dailyLog/dailyLogStore'
import { useHabitsStore } from 'src/stores/habit/habitStore'
import Utils from 'src/util'
import { PropType, ref } from 'vue'

export interface Props {
  entry: CompletionEntry | null
}

const props = withDefaults(defineProps<Props>(), {
  entry: null,
})

const e = ref<CompletionEntry>(
  Utils.hardCheck(
    props.entry as CompletionEntry,
    'completion entry is undefined or null'
  )
)

const completionStore = useCompletionsStore()
const dailyLogStore = useDailyLogsStore()
const habitStore = useHabitsStore()

const updateCompletedStatus = async (r: CompletionEntry) => {
  const result = await completionStore.updateItem(r)
  console.log(`#${r.id} status is now ${r.status} - api result: `, result)
  const dateOf = completionStore.dateValueFromDailyLog(r.id)
  await dailyLogStore.reSampleHabitsGivenDate(dateOf)
}
</script>

<template>
  <q-checkbox
    v-model="e.status"
    :indeterminate-value="0"
    :true-value="2"
    :false-value="1"
    indeterminate-icon="check_box_outline_blank"
    @click="updateCompletedStatus(e)"
  />
  <q-item-label>{{ habitStore.getByID(e?.habitID)?.title }}</q-item-label>
  <q-item-label v-if="completionStore.isSampled(e)"
    ><q-icon name="star"></q-icon
  ></q-item-label>
</template>
