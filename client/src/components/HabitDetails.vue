<template>
  <div>
    <h1>{{ habit }}</h1>
  </div>
</template>

<script setup lang="ts">
import { Habit } from 'src/stores/habit/habit';

const props = defineProps({
  habit: Habit
})

setup(props) {
  
}
</script>