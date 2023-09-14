<template>
  <q-page padding>
    <div>
      <completion-entry-card title="All Completions" :completionEntries="completions"></completion-entry-card>
      
    </div>
  </q-page>
</template>

<script lang="ts">
import { mapRepos, useRepo } from 'pinia-orm';
import { Habit } from 'src/stores/habit/habit';
import { defineComponent } from 'vue'
import CompletionEntryCard from 'src/components/CompletionEntryCard.vue';
import { User } from 'src/stores/user/user';
import CompletionEntry from 'src/stores/completion/completion';
import DailyLog from 'src/stores/daily-log/daily-log';
export default defineComponent({
  name: 'CompletionsPage',
  components: {
    CompletionEntryCard
  },
  async setup() {
    const repo = useRepo(CompletionEntry)
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
    await useRepo(Habit).piniaStore().axios_getAll()
    const completionStore = repo.piniaStore()
    await completionStore.axios_getAll()
    await useRepo(DailyLog).piniaStore().axios_getAll()
  },
  computed: {
    ...mapRepos({
      completionRepo: CompletionEntry,
      habitRepo: Habit,
      dailyLogRepo: DailyLog
    }),
    completions(): CompletionEntry[] {
      const habits = this.habitRepo.with('completionEntries').get()
      console.log("habits in computed function: ", habits.slice(0, 10), ` and ${habits.length-10} more`)
      const logs = this.dailyLogRepo.all()
      console.log("logs in computed function: ", logs.slice(0, 10), `and ${logs.length-10} more`)
      const completions = this.completionRepo.with('habit').with('log').get()
      console.log("completions in computed function: ", completions.slice(0, 10), ` and ${completions.length-10} more`)
      return completions
    }
  },
  methods: {
    // async addDemoHabit() {
    //   console.log("start async create")
    //   let result = await this.habitRepo.piniaStore().axios_createItem({
    //     userId: 1,
    //     title: 'DEMO HABIT FROM BUTTON',
    //     times_sampled: 10,
    //     times_completed: 1
    //   })
    //   console.log("result is: ", result)
    //   console.log("habit Repo: ", this.habitRepo.withAll().all())
    //   console.log("refreshing habits repo")
    //   this.habitRepo.piniaStore().axios_getAll()
    //   return result
    // }
  }
})
</script>
