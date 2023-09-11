<template>
    <q-page class="row items-center justify-evenly">
      <div>
        <habit-card title="Your Best Habits" :habits="roses"></habit-card>
        <habit-card title="Areas to Improve" :habits="thorns"></habit-card>
        <q-btn v-if="habits.length" @click="nav('habits')" icon="list">See All Habits</q-btn>
        <h1 v-if="habits.length == 0">no habits</h1>
      </div>
    </q-page>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { Habit } from 'stores/habit/habit'
import { mapRepos, useRepo } from 'pinia-orm'
import { User } from 'src/stores/user/user'
import HabitCard from 'components/HabitCard.vue'
import CompletionEntry from 'src/stores/completion/completion'
import DailyLog from 'src/stores/daily-log/daily-log'

export default defineComponent({
  name: 'IndexPage',
  components: {
    HabitCard
  },
  async setup() {
    let du = await useRepo(User).piniaStore().axios_getAll()
    await useRepo(Habit).piniaStore().axios_getAll()
  },
  computed: {
    ...mapRepos({
      habitRepo: Habit,
      userRepo: User,
      completionRepo: CompletionEntry,
      dailyLogRepo: DailyLog
    }),
    defaultUser(): User {
      const defaultUser = this.userRepo.where('name', 'DEFAULT').first()
      if(defaultUser == null) throw new Error('default user was not found')
      return defaultUser
    },
    habits(): Habit[] {
      return this.habitRepo.all()
    },
    roses(): Habit[] {
      const threshold = this.defaultUser.completionRateThreshold
      if(typeof threshold === 'undefined') {
        throw new Error('completion rate threshold of default user is undefined')
      }
      return this.habitRepo.where('completionRate', (value: number) => { 
        return value >= threshold
      })
      .orderBy('completionRate', 'desc')
      .get()
    },
    thorns(): Habit[] {
      return this.habitRepo
      .orderBy('completionRate')
      .limit(this.defaultUser.currentSampleRate)
      .get()
    }
  },
  methods: {
    nav(link: string) {
      this.$router.push(`${link}`)
    }
  }
})
</script>
