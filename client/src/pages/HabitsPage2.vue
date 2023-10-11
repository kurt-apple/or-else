<script setup lang="ts">
import { useQuasar } from 'quasar'
import HabitList from 'src/components/HabitList.vue'
import HabitDetails from 'src/components/HabitDetails.vue'
import { Habit, useHabitsStore } from 'src/stores/habit/habitStore'
import { computed } from 'vue'

const hs = useHabitsStore()
const hlist = computed(() => hs.getAll())

const addHabit = async (item: Habit) => {
  console.log('add habit')
  await hs.createItem(item)
  console.log(
    'habits list now: ',
    hs.getAll().map((x) => x.id + ': ' + x.title)
  )
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
      console.log('create habit on OK', action.item)
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

<template>
  <q-page padding>
    <div>
      <habit-list title="All Habits" :habits="hlist" />
    </div>
    <q-page-sticky position="bottom-right" :offset="[18, 18]">
      <q-btn fab icon="add" color="accent" @click="addHabitDialog" />
    </q-page-sticky>
  </q-page>
</template>
