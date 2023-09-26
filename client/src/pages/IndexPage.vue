<template>
  <q-page class="row items-center justify-evenly">
    <div>
      <q-btn @click="loadAll()">LOAD ALL</q-btn>
      <new-habit-card
        title="Your Best Habits"
        :habits="habitRepo.roses()"
      ></new-habit-card>
      <new-habit-card
        title="Areas to Improve"
        :habits="habitRepo.thorns()"
      ></new-habit-card>
      <q-btn icon="list" @click="nav('habits')">See All Habits</q-btn>
      <h1 v-if="habits.length == 0">no habits</h1>
    </div>
  </q-page>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import TheGreatHydrator from 'src/stores/TheGreatHydrator'
import { useHabitsStore } from 'src/stores/habit/habitStore'
import NewHabitCard from 'src/components/NewHabitCard.vue'

export default defineComponent({
  name: 'IndexPage',
  components: { NewHabitCard },
  async setup() {
    await TheGreatHydrator.brrrrr()
    const habitRepo = useHabitsStore()
    const habits = computed(() => {
      return habitRepo.getAll()
    })
    const thorns = computed(() => {
      return habitRepo.thorns()
    })
    const roses = computed(() => {
      return habitRepo.roses()
    })
    return {
      habitRepo,
      roses,
      thorns,
      habits,
    }
  },
  methods: {
    nav(link: string) {
      this.$router.push(`${link}`)
    },
    async loadAll() {
      await TheGreatHydrator.brrrrr()
    },
  },
})
</script>
