<template>
  <q-page padding>
    <div>
      <habit-list
        :key="componentKey"
        title="All Habits"
        :habits="habits"
        @update="refreshList"
      ></habit-list>
    </div>
    <q-page-sticky position="bottom-right" :offset="[18, 18]">
      <q-btn fab icon="add" color="accent" @click="addHabitDialog" />
    </q-page-sticky>
  </q-page>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar'
import HabitList from 'src/components/HabitList.vue'
import HabitDetails from 'src/components/HabitDetails.vue'
import { useCompletionsStore } from 'src/stores/completion/completionStore'
import { Habit, useHabitsStore } from 'src/stores/habit/habitStore'
import { ref } from 'vue'

const habitsStore = useHabitsStore()

const habits = ref(habitsStore.items)

const refreshList = async () => {
  console.log('refreshing list...')
  habits.value = await habitsStore.fetchAll()
}

const addHabit = async (item: Habit) => {
  console.log('add habit')
  await habitsStore.createItem(item)
  await useCompletionsStore().fetchAll()
  await refreshList()
}

const componentKey = ref(0)

const forceRender = () => {
  componentKey.value += 1
}

const $q = useQuasar()
const addHabitDialog = () => {
  console.log('add habit dialog')
  $q.dialog({
    component: HabitDetails,
    componentProps: {
      habit: null,
      mode: 'create',
    },
  })
    .onOk(async (action: { item: Habit; unsaved: boolean }) => {
      console.log('create')
      await addHabit(action.item)
    })
    .onCancel(() => {
      console.log('Cancel')
    })
    .onDismiss(() => {
      console.log('Dismissed Dialog')
    })
}
</script>
