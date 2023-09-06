<template>
  <q-page class="row items-center justify-evenly">
    <example-component
      title="Example component"
      active
      :todos="todos"
      :meta="meta"
      v-if="todos.length > 0"
    ></example-component>
    <h1 v-if="todos.length == 0">no habits</h1>
  </q-page>
</template>

<script lang="ts">
import { Meta } from 'components/models'
import ExampleComponent from 'components/ExampleComponent.vue'
import { defineComponent, ref } from 'vue'
import { Habit } from 'stores/habit/habit'
import { mapRepos, useRepo } from 'pinia-orm'

export default defineComponent({
  name: 'IndexPage',
  components: { ExampleComponent },
  setup() {
    const repo = useRepo(Habit)
    console.log({ repo: repo })
    try {
      repo.piniaStore()
    } catch (error: any) {
      console.error('error accessing pinia store.', error)
    }
    if (repo.piniaStore() == null || typeof repo.piniaStore() === 'undefined') {
      throw new Error('Pinia Store is not found')
    } else {
      console.log({ 'pinia store': repo.piniaStore() })
      console.log('custom options: ', repo.getModel().$piniaOptions())
    }
    const habitStore = repo.piniaStore()
    const habits = habitStore.axios_getAll()
    console.log({ repo: repo, habits: habits })
    const meta = ref<Meta>({
      totalCount: 1200,
    })
    return { meta }
  },
  computed: {
    ...mapRepos({
      habitRepo: Habit,
    }),
    todos(): Habit[] {
      return this.habitRepo.all()
    },
  },
})
</script>
