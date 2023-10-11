<script setup lang="ts">
import { Habit, useHabitsStore } from 'src/stores/habit/habitStore'
import HabitTreeNode from './HabitTreeNode.vue'
import { computed, ref } from 'vue'

const hs = useHabitsStore()

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

const habitsc = ref(props.habits ?? [])

console.log('HabitList: habits = ', habitsc)

const editModeToggle = ref(false)

const toggleEditMode = () => (editModeToggle.value = !editModeToggle.value)
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
    <q-list v-if="!editModeToggle && !hs.loading">
      <q-item v-for="(h, index) in habitsc" :key="index">
        <habit-tree-node :habit="h"></habit-tree-node>
      </q-item>
    </q-list>
  </div>
</template>
