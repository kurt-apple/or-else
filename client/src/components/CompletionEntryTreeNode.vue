<script setup lang="ts">
import {
  CompletionEntry,
  useCompletionsStore,
  habitStatus,
  sampleType,
} from 'src/stores/completion/completionStore'
import { useDailyLogsStore } from 'src/stores/dailyLog/dailyLogStore'
import { useHabitsStore } from 'src/stores/habit/habitStore'
import Utils from 'src/util'
import { computed, ref } from 'vue'

export interface Props {
  entry?: CompletionEntry
}

const props = withDefaults(defineProps<Props>(), {
  entry: undefined,
})

const e = ref<CompletionEntry>(
  Utils.hardCheck(
    props.entry as CompletionEntry,
    'completion entry is undefined or null'
  )
)

const completionStore = useCompletionsStore()
const habitStore = useHabitsStore()
const dls = useDailyLogsStore()

const updateCompletedStatus = async (r: CompletionEntry) => {
  console.log('going to update status now...')
  await completionStore.updateStatus(r, r.status)
  console.log(`#${r.id} status is now ${r.status}`)
}

const statusValue = computed(() => {
  if (props.entry?.status === habitStatus.UNSPECIFIED) return 'unspecified'
  if (props.entry?.status === habitStatus.NOTCOMPLETED) return 'not completed'
  return 'completed'
})
</script>

<template>
  <q-checkbox
    v-model="e.status"
    :indeterminate-value="habitStatus.UNSPECIFIED"
    :true-value="habitStatus.COMPLETED"
    :false-value="habitStatus.NOTCOMPLETED"
    checked-icon="thumb_up"
    unchecked-icon="thumb_down"
    indeterminate-icon="check_box_outline_blank"
    @click="updateCompletedStatus(e)"
  />
  <q-item-section>
    <q-item-label>{{ habitStore.getByID(e.habitID)?.title }}</q-item-label>
  </q-item-section>
  <q-item-section>
    <q-item-label> status: {{ statusValue }}</q-item-label>
  </q-item-section>
  <q-item-section>
    <q-item-label v-if="e.sampleType === sampleType.TOPPERFORMER">
      <q-icon name="star" />
    </q-item-label>
    <q-item-label v-if="e.sampleType === sampleType.NEEDSWORK">
      <q-icon name="info" />
    </q-item-label>
  </q-item-section>
  <q-item-section>
    <q-item-label>
      {{ e.completionRateOnDate }}
    </q-item-label>
  </q-item-section>
</template>
