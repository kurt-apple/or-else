<script setup lang="ts">
import {
  CompletionEntry,
  useCompletionsStore,
} from 'src/stores/completion/completionStore'
import { useDailyLogsStore } from 'src/stores/dailyLog/dailyLogStore'
import { Habit, useHabitsStore } from 'src/stores/habit/habitStore'
import Utils from 'src/util'
import { defineComponent, ref } from 'vue'
import HabitDetails from './HabitDetails.vue'
import { useQuasar } from 'quasar'

const HabitList = defineComponent({
  name: 'HabitList',
})

const habitsStore = useHabitsStore()
const completionsStore = useCompletionsStore()
export interface Props {
  title?: string
  habits?: Array<Habit>
  showEditButton?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Habits',
  habits: () => [],
  showEditButton: true,
})

const emit = defineEmits(['update'])

const editModeToggle = ref(false)
const viewDetailsToggle = ref(false)
const currentHabit = ref<Habit>()

const toggleEditMode = () => (editModeToggle.value = !editModeToggle.value)

const updateCompletedStatus = async (h: { h: Habit; ce: CompletionEntry }) => {
  const latest = h.ce
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
  const nextLog = logStore.nextLog(log)
  await logStore.reSample(nextLog)
}
const deleteHabit = async (habit: Habit) => {
  console.log('delete item id: ', habit.id)
  let result
  if (habit.id != null) {
    result = await useHabitsStore().deleteItem(habit.id)
    console.log('result: ', result)
  }
}

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
      await habitsStore.updateItem(action.item)
      console.log('OK')
      emit('update')
    })
    .onCancel(() => {
      console.log('Cancel')
    })
    .onDismiss(() => {
      console.log('Dismissed Dialog')
    })
}

const habitMap = ref<{ h: Habit; ce: CompletionEntry }[]>(
  props.habits.map((x) => ({
    h: x,
    ce: completionsStore.latestCompletionEntryForHabit(x.id),
  }))
)
</script>

<template>
  <div>
    <h2>{{ title }}</h2>
    <h4 v-if="habits.length == 0">None Yet</h4>
    <q-btn
      v-if="habits.length && showEditButton"
      :icon="editModeToggle ? 'visibility' : 'edit'"
      @click="toggleEditMode"
    ></q-btn>
    <q-list v-if="!editModeToggle">
      <q-item v-for="(h, index) in habitMap" :key="index">
        <q-item-section>
          <q-btn icon="info" @click="viewDetails(h.h)" />
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
          <q-item-label>
            {{
              Math.round(
                habitsStore.times_sampled(h.h.id) === 0
                  ? 0
                  : (habitsStore.times_completed(h.h.id) /
                      habitsStore.times_sampled(h.h.id)) *
                      100
              )
            }}% Completion Rate out of
            {{ habitsStore.times_sampled(h.h.id) }}</q-item-label
          >
        </q-item-section>
      </q-item>
    </q-list>
    <q-list v-else>
      <q-item v-for="(h, index) in habitMap" :key="index">
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
