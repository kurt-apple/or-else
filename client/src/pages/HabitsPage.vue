<template>
  <q-page padding>
    <div>
      <habit-card
        title="All Habits"
        :habits="useHabitsStore().getAll()"
      ></habit-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import HabitCard from 'src/components/HabitCard.vue'
import { useHabitsStore } from 'src/stores/habit/habitStore'
</script>
