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
import TheGreatHydrator from 'src/stores/TheGreatHydrator';
export default defineComponent({
  name: 'CompletionsPage',
  components: {
    CompletionEntryCard
  },
  async setup() {
    await TheGreatHydrator.hydratify([useRepo(User), useRepo(Habit), useRepo(DailyLog), useRepo(CompletionEntry)])
    
  },
  computed: {
    ...mapRepos({
      completionRepo: CompletionEntry,
      habitRepo: Habit,
      dailyLogRepo: DailyLog
    }),
    completions(): CompletionEntry[] {
      const habits = this.habitRepo.all()
      //console.log("habits in computed function: ", habits.slice(0, 10), ` and ${habits.length-10} more`)
      const logs = this.dailyLogRepo.withAll().get()
      //console.log("logs in computed function: ", logs.slice(0, 10), `and ${logs.length-10} more`)
      const completions = this.completionRepo.all()
      //console.log("completions in computed function: ", completions.slice(0, 10), ` and ${completions.length-10} more`)
      const id_to_find = completions[0].dailyLogID ?? -1
      const loggy = this.dailyLogRepo.find('2')
      console.log("linked log is ", loggy, "; id ", id_to_find, "; meanwhile logs has this in its store: ", this.dailyLogRepo.all())
      const foo = this.dailyLogRepo.where((log) => {
        return log.id == completions[0].dailyLogID
      }).get()
      console.log("foo method: ", foo)
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
