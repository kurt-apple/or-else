<template>
  <q-page padding>
    <div>
      <habit-card title="All Habits" :habits="habits"></habit-card>
      <q-btn @click="addDemoHabit" icon="plus">add demo habit</q-btn>
    </div>
  </q-page>
</template>

<script lang="ts">
import { mapRepos, useRepo } from 'pinia-orm';
import { Habit } from 'src/stores/habit/habit';
import { defineComponent } from 'vue'
import HabitCard from 'components/HabitCard.vue';
import { User } from 'src/stores/user/user';
export default defineComponent({
  name: 'HabitsPage',
  components: {
    HabitCard
  },
  async setup() {
    const repo = useRepo(Habit)
    try {
      repo.piniaStore()
    } catch (error: any) {
      console.error('error accessing pinia store.', error)
    }
    if (repo.piniaStore() == null || typeof repo === 'undefined') {
      throw new Error('Pinia store is not found')
    }
    const userRepo = useRepo(User)
    await userRepo.piniaStore().axios_getAll()
    console.log("default user: ", useRepo(User).where('name', 'DEFAULT').first())
    const habitStore = repo.piniaStore()
    await habitStore.axios_getAll()
    console.log("habit repo: ", repo.withAll().all())
  },
  computed: {
    ...mapRepos({
      habitRepo: Habit,
    }),
    habits(): Habit[] {
      return this.habitRepo.all()
    }
  },
  methods: {
    async addDemoHabit() {
      console.log("start async create")
      let result = await this.habitRepo.piniaStore().axios_createItem({
        userId: 1,
        title: 'DEMO HABIT FROM BUTTON',
        times_sampled: 10,
        times_completed: 1
      })
      console.log("result is: ", result)
      console.log("habit Repo: ", this.habitRepo.withAll().all())
      console.log("refreshing habits repo")
      this.habitRepo.piniaStore().axios_getAll()
      return result
    }
  }
})
</script>
