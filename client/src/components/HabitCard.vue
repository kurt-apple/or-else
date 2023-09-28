<script setup lang="ts">
import {
  CompletionEntry,
  useCompletionsStore,
} from 'src/stores/completion/completionStore'
import { useDailyLogsStore } from 'src/stores/dailyLog/dailyLogStore'
import { Habit, useHabitsStore } from 'src/stores/habit/habitStore'
import Utils from 'src/util'
import { defineComponent, ref } from 'vue'

const HabitCard = defineComponent({
  name: 'HabitCard',
})

const habitsStore = useHabitsStore()
const completionsStore = useCompletionsStore()
export interface Props {
  title?: string
  habits?: Array<Habit>
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Habits',
  habits: () => [],
})

console.log('bloop')

const editModeToggle = ref(false)
const viewDetailsToggle = ref(false)
const currentHabit = ref<Habit>()

const toggleEditMode = () => (editModeToggle.value = !editModeToggle.value)

// const logDate = (h: Habit) => {
//   const latestLog = habitsStore.latestDailyLog(
//     Utils.hardCheck(h.id, 'habit id is not known')
//   )
//   return Utils.d(
//     Utils.hardCheck(
//       latestLog,
//       'could not retrieve the daily log from latest completion entry of habit'
//     ).logDate
//   )
// }

console.log('bloop')
const updateCompletedStatus = async (h: { h: Habit; ce: CompletionEntry }) => {
  const latest = Utils.hardCheck(h.ce, 'Could not find latest log for habit')
  const result = await useCompletionsStore().updateItem(latest)
  console.log(
    `#${h.h.id} status is now ${latest.status} - api result: `,
    result
  )
  const logStore = useDailyLogsStore()
  const log = Utils.hardCheck(
    logStore.getByID(h.ce.dailyLogID),
    'Could not find log associated with latest completion entry of habit'
  )
  const logDate = Utils.d(log.logDate)
  const logsToRefresh = useDailyLogsStore()
    .getAll()
    .filter((log) => {
      return Utils.d(log.logDate).getTime() > logDate.getTime()
    })
    .sort((a, b) => Utils.mddl(a, b, 'asc'))

  for (let i = 0; i < logsToRefresh.length; i++) {
    await logStore.reSampleHabits(logsToRefresh[i].id)
  }
}
const deleteHabit = async (habit: Habit) => {
  console.log('delete item id: ', habit.id)
  let result
  if (habit.id != null) {
    result = await useHabitsStore().deleteItem(habit.id)
    console.log('result: ', result)
  }
}
console.log('hi')

const viewDetails = (h: Habit) => {
  currentHabit.value = h
  viewDetailsToggle.value = !viewDetailsToggle.value
}
</script>

<template>
  <div>
    <q-dialog v-model="viewDetailsToggle">
      <q-card>
        <q-card-section>
          <div class="text-h6">Habit Details</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          Habit name is {{ currentHabit?.title }}. Completion Rate is
          {{ habitsStore.completionRate(currentHabit?.id) }}.
        </q-card-section>

        <q-card-actions align="right">
          <q-btn v-close-popup flat label="OK" color="primary" />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <h2>{{ title }}</h2>
    <h4 v-if="habits.length == 0">None Yet</h4>
    <q-btn
      v-if="habits.length"
      :icon="editModeToggle ? 'visibility' : 'edit'"
      @click="toggleEditMode"
    ></q-btn>
    <q-list v-if="!editModeToggle">
      <q-item
        v-for="(h, index) in habits.map((x) => ({
          h: x,
          ce: Utils.hardCheck(
            completionsStore.latestCompletionEntryForHabit(x.id),
            'oops'
          ),
        }))"
        :key="index"
      >
        <q-item-section>
          <q-btn icon="info" @click="viewDetails(h.h)">DETAILS</q-btn>
        </q-item-section>
        <q-checkbox
          v-model="h.ce.status"
          :indeterminate-value="0"
          :false-value="1"
          :true-value="2"
          indeterminate-icon="check_box_outline_blank"
          @click="updateCompletedStatus(h)"
        ></q-checkbox>
        <q-item-section>
          <q-item-label> {{ h.h.title }}</q-item-label>
        </q-item-section>
        <q-item-section>
          been completed {{ habitsStore.times_completed(h.h.id) }} times outta
          {{ habitsStore.times_sampled(h.h.id) }}</q-item-section
        >
        <q-item-section>
          <q-item-label> {{ habitsStore.completionRate(h.h.id) }}</q-item-label>
        </q-item-section>
      </q-item>
    </q-list>
    <q-list v-else>
      <q-item
        v-for="(h, index) in habits.map((x) => ({
          h: x,
          ce: Utils.hardCheck(
            completionsStore.latestCompletionEntryForHabit(x.id),
            'oops'
          ),
        }))"
        :key="index"
      >
        <q-item-section>
          {{ h.h.id }}
        </q-item-section>
        <q-item-section>
          <q-item-label> edit mode: {{ h.h.title }}</q-item-label>
        </q-item-section>
        <q-item-section>
          <q-item-label> {{ habitsStore.completionRate(h.h.id) }}</q-item-label>
        </q-item-section>
        <q-item-section>
          <q-btn icon="delete" color="negative" @click="deleteHabit(h.h)" />
        </q-item-section>
      </q-item>
    </q-list>
  </div>
</template>
