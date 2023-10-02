<template>
  <q-page padding>
    <habit-details v-if="showEntryForm" :habit="currentHabit"></habit-details>
    <div>
      <habit-card
        title="All Habits"
        :habits="useHabitsStore().getAll()"
      ></habit-card>
    </div>
    <q-page-sticky position="bottom-right" :offset="[18, 18]">
      <q-btn fab icon="add" color="accent" @click="showDialog" />
    </q-page-sticky>
  </q-page>
</template>

<script setup lang="ts">
import HabitCard from 'src/components/HabitCard.vue'
import HabitDetails from 'src/components/HabitDetails.vue'
import { Habit, useHabitsStore } from 'src/stores/habit/habitStore'
import { ref } from 'vue'
const showEntryForm = ref(false)
const currentHabit = ref<Habit>(new Habit({}))
const showDialog = () => {
  showEntryForm.value = !showEntryForm.value
}
</script>
