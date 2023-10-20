<script setup lang="ts">
import { useQuasar } from 'quasar'
import { Habit, useHabitsStore } from 'src/stores/habit/habitStore'
import HabitDetails from './dialog/HabitDetails.vue'
import Utils from 'src/util'
import { computed, ref } from 'vue'
import {
  CompletionEntry,
  habitStatus,
  useCompletionsStore,
} from 'src/stores/completion/completionStore'
import { useDailyLogsStore } from 'src/stores/dailyLog/dailyLogStore'

const completionEntryStore = useCompletionsStore()

export interface Props {
  habit?: Habit
}

const props = withDefaults(defineProps<Props>(), {
  habit: undefined,
})

const h = ref(Utils.hardCheck(props.habit))
console.log('HabitTreeNode habit = ', h.value.title)
const le = computed(() => {
  return completionEntryStore.latestCompletionEntryForHabit(h.value.id)
})

const hs = useHabitsStore()
const $q = useQuasar()
const viewDetails = (h: Habit) => {
  console.log('clicked details button for ', h.title)
  $q.dialog({
    component: HabitDetails,
    componentProps: {
      habit: h,
      mode: 'update',
    },
  })
    .onOk(async (action: { item: Habit; unsaved: boolean }) => {
      console.log('action: ', action)
      console.log('update')
      await hs.updateItem(action.item)
      console.log('OK')
    })
    .onCancel(() => {
      console.log('Cancel')
    })
    .onDismiss(() => {
      console.log('Dismissed Dialog')
    })
}

const updateCompletedStatus = async (ce: CompletionEntry) => {
  const result = await useCompletionsStore().updateItem(ce)
  console.log(
    `#${ce.habitID} status is now ${ce.status} - api result: `,
    result
  )
  const logStore = useDailyLogsStore()
  const log = Utils.hardCheck(
    logStore.getByID(ce.dailyLogID),
    'Could not find log associated with latest completion entry of habit'
  )
  const nextLog = logStore.nextLog(log)
  logStore.reSample(nextLog)
}
</script>
<template>
  <q-item-section>
    <q-btn icon="info" @click="viewDetails(h)" />
  </q-item-section>
  <q-checkbox
    v-if="le"
    v-model="le.status"
    :indeterminate-value="habitStatus.UNSPECIFIED"
    :true-value="habitStatus.COMPLETED"
    :false-value="habitStatus.NOTCOMPLETED"
    checked-icon="thumb_up"
    unchecked-icon="thumb_down"
    indeterminate-icon="check_box_outline_blank"
    @click="updateCompletedStatus(le)"
  ></q-checkbox>
  <q-item-section>
    <q-item-label> {{ h.title }}</q-item-label>
  </q-item-section>
  <q-item-section>
    <q-item-label>
      {{
        Math.round(
          hs.times_sampled(h.id) === 0
            ? 0
            : (hs.times_completed(h.id) / hs.times_sampled(h.id)) * 100
        )
      }}% Completion Rate out of {{ hs.times_sampled(h.id) }}</q-item-label
    >
  </q-item-section>
</template>
