<template>
  <q-page padding>
    <div>
      <daily-log-card title="All Daily Logs" :logs="dailyLogs"></daily-log-card>
    </div>
  </q-page>
</template>

<script lang="ts">
import { mapRepos, useRepo } from 'pinia-orm';
import { Habit } from 'src/stores/habit/habit';
import { defineComponent } from 'vue'
import DailyLogCard from 'src/components/DailyLogCard.vue';
import { User } from 'src/stores/user/user';
import CompletionEntry from 'src/stores/completion/completion';
import DailyLog from 'src/stores/daily-log/daily-log';
export default defineComponent({
  name: 'CompletionsPage',
  components: {
    DailyLogCard
  },
  async setup() {
    const repo = useRepo(DailyLog)
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
    const logStore = repo.piniaStore()
    await logStore.axios_getAll()
    console.log("daily log repo: ", repo.with('completionEntries').get())
  },
  computed: {
    ...mapRepos({
      logRepo: DailyLog,
    }),
    dailyLogs(): DailyLog[] {
      const logs = this.logRepo.with('completionEntries').get()
      return logs
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
