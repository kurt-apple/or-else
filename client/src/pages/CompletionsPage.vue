<template>
  <q-page padding>
    <div>
      <completion-entry-card
        title="All Completions"
        :completion-entries="completions"
      ></completion-entry-card>
    </div>
  </q-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import CompletionEntryCard from 'src/components/CompletionEntryCard.vue'
import {
  CompletionEntry,
  useCompletionsStore,
} from 'src/stores/completion/completionStore'
export default defineComponent({
  name: 'CompletionsPage',
  components: {
    CompletionEntryCard,
  },
  computed: {
    completions(): CompletionEntry[] {
      console.log('re-fetching completions')
      return useCompletionsStore().getAll()
    },
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
  },
})
</script>
