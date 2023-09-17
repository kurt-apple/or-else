<template>
    <q-page class="row items-center justify-evenly">
      <div>
        <habit-card title="Your Best Habits" :habits="roses"></habit-card>
        <habit-card title="Areas to Improve" :habits="thorns"></habit-card>
        <q-btn @click="nav('habits')" icon="list">See All Habits</q-btn>
        <h1 v-if="habits.length == 0">no habits</h1>
      </div>
    </q-page>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import { Habit } from 'stores/habit/habit'
import { mapRepos, useRepo } from 'pinia-orm'
import { User } from 'src/stores/user/user'
import HabitCard from 'components/HabitCard.vue'
import CompletionEntry from 'src/stores/completion/completion'
import DailyLog from 'src/stores/daily-log/daily-log'
import TheGreatHydrator from 'src/stores/TheGreatHydrator'

export default defineComponent({
  name: 'IndexPage',
  components: {
    HabitCard
  },
  async setup() {
    await TheGreatHydrator.brrrrr()
    const dailyLogRepo = useRepo(DailyLog)
    const habitRepo = useRepo(Habit)
    const userRepo = useRepo(User)
    const habits = computed(() => {
      return habitRepo.all()
    })
    const latestLog = computed(() => {
      return dailyLogRepo.orderBy('logDate', 'desc').limit(1).get()[0]
    })
    const defaultUser = computed(() => {
      const defaultUser = userRepo.where('name', 'DEFAULT').first()
      if(defaultUser == null) throw new Error('default user was not found')
      return defaultUser
    })
    const thorns = computed(() => {
      console.log("latest log: ", latestLog.value.formattedDate)
      console.log("sample rate: ", latestLog.value.sampleRate)
      let habits = habitRepo.with('completionEntries').get()
      habits.sort((a, b) => a.completionRate - b.completionRate)
      return habits.slice(0, latestLog.value.sampleRate)
    })
    const roses = computed(() => {
      const threshold = defaultUser.value.completionRateThreshold
      if(typeof threshold === 'undefined') {
        throw new Error('completion rate threshold of default user is undefined')
      }
      let habits = habitRepo.with('completionEntries').get()
      return habits.filter((x) => x.completionRate >= threshold)
    })
    const updateLists = () => {
      console.log("whoopdiedoo why rtfm if you can loopdydoooooo")
      thorns
      roses
      setTimeout(updateLists, 10000)
    }
    updateLists()
    return {
      roses,
      thorns,
      habits
    }
  },
  methods: {
    nav(link: string) {
      this.$router.push(`${link}`)
    }
  }
})
</script>
