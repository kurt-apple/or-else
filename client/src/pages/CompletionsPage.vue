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
    const completionStore = repo.piniaStore()
    await completionStore.axios_getAll()
    console.log("completion repo: ", repo.withAll().all())
  },
  computed: {
    ...mapRepos({
      completionRepo: CompletionEntry,
    }),
    completions(): CompletionEntry[] {
      return this.completionRepo.all()
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
