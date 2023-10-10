<script setup lang="ts">
import TheGreatHydrator from 'src/stores/TheGreatHydrator'
import { useHabitsStore } from 'src/stores/habit/habitStore'
import HabitList from '../components/HabitList.vue'
import RationProgress from '../components/RationProgress.vue'
import { useRouter } from 'vue-router'

const habitRepo = useHabitsStore()
const router = useRouter()

await TheGreatHydrator.brrrrr()
</script>

<template>
  <q-page class="row items-center justify-evenly">
    <div>
      <h1>Ration</h1>
      <ration-progress></ration-progress>
      <habit-list
        title="Your Best Habits"
        :habits="habitRepo.roses()"
        :show-edit-button="false"
        @update="habitRepo.roses"
      />
      <habit-list
        title="Areas to Improve"
        :habits="habitRepo.thorns()"
        :show-edit-button="false"
        @update="habitRepo.thorns"
      />
      <q-btn icon="list" @click="router.push('habits')">See All Habits</q-btn>
      <h1 v-if="habitRepo.getAll().length == 0">no habits</h1>
    </div>
  </q-page>
</template>
