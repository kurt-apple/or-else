<template>
  <q-dialog>
    <q-card>
      <q-card-section>
        <div class="text-h6">Habit Details</div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        Habit name is {{ habit?.title }}. Completion Rate is
        {{ habitsStore.completionRate(habit?.id) }}.
      </q-card-section>

      <q-card-actions align="right">
        <q-btn v-close-popup flat label="OK" color="primary" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { Habit, useHabitsStore } from 'src/stores/habit/habitStore'

const props = defineProps({
  habit: Habit,
})

const habitsStore = useHabitsStore()
</script>
