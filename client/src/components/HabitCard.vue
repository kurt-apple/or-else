<template>
  <div>
    <h1>{{ title }}</h1>
    <q-btn :icon="editModeToggle ? 'visibility' : 'edit'" @click="toggleEditMode"></q-btn>
    <q-list v-if="!editModeToggle">
      <q-item v-for="h, index in habits" :key="index">
        
        <q-item-section>
          <q-item-label> {{ h.title }}</q-item-label>
        </q-item-section>
        <q-item-section>
          <q-item-label> {{ h.completionRate }}</q-item-label>
        </q-item-section>
      </q-item>
    </q-list>
    <q-list v-else>
      <q-item v-for="h in habits" :key="h.title">
        <q-item-section>
          {{  h.id }}
        </q-item-section>
        <q-item-section>
          <q-item-label> edit mode: {{ h.title }}</q-item-label>
        </q-item-section>
        <q-item-section>
          <q-item-label> {{ h.completionRate }}</q-item-label>
        </q-item-section>
        <q-item-section>
          <q-btn icon="delete" @click="deleteHabit(h)" color="negative"/>
        </q-item-section>
      </q-item>
    </q-list>
  </div>
  
</template>

<script lang="ts">
import { mapRepos } from 'pinia-orm';
import DailyLog from 'src/pages/DailyLog.vue';
import CompletionEntry from 'src/stores/completion/completion';
import { Habit } from 'src/stores/habit/habit';
import { PropType, defineComponent, ref } from 'vue';
export default defineComponent({
  name: 'HabitCard',
  props: {
    title: {
      type: String,
      default: 'Habits'
    },
    habits: {
      type: Array as PropType<Habit[]>,
      default: () => []
    }
  },
  setup() {
    return {
      editModeToggle: ref(false)
    }
  },
  computed: {
    ...mapRepos ({
      habitRepo: Habit,
      dailyLogRepo: DailyLog
    }),
  },
  methods: {
    async deleteHabit(habit: Habit) {
      console.log("delete item id: ", habit.id)
      let result;
      if(habit.id != null) {
        result = await this.habitRepo.piniaStore().axios_deleteItem(habit.id)
      }
      console.log("result: ", result)
      this.habitRepo.piniaStore().axios_getAll()
    },
    toggleEditMode() {
      this.editModeToggle = !this.editModeToggle
      console.log("edit mode is now ", this.editModeToggle ? "enabled" : "disabled")
    }
  }
})
</script>