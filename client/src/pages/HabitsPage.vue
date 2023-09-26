<template>
  <q-page padding>
    <div>
      <habit-card title="All Habits" :habits="habits"></habit-card>
    </div>
  </q-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import HabitCard from 'components/HabitCard.vue'
import { Habit } from '@/stores/habit/habitStore'
import { useUsersStore } from '@/stores/user/userStore'
export default defineComponent({
  name: 'HabitsPage',
  components: {
    HabitCard,
  },
  computed: {
    habits(): Habit[] {
      return useUsersStore().defaultUser().habits
    },
  },
  methods: {
    // async addDemoHabit() {
    //   console.log('start async create')
    //   let result = await useHabitsStore().createItem({
    //     userId: useUsersStore().defaultUser().g,
    //     title: 'DEMO HABIT FROM BUTTON',
    //     times_sampled: 10,
    //     times_completed: 1,
    //   })
    //   console.log('result is: ', result)
    //   console.log('habit Repo: ', this.habitRepo.withAll().all())
    //   console.log('refreshing habits repo')
    //   this.habitRepo.piniaStore().axios_getAll()
    //   return result
    // },
  },
})
</script>
