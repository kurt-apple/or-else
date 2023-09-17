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
      console.log("re-fetching completions")
      const completions = this.completionRepo.all()
      //console.log("some completions: ", completions[0].status)
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
