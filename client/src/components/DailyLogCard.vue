<template>
  <div>
    <h1>{{ title }}</h1>
    <q-btn :icon="editModeToggle ? 'visibility' : 'edit'" @click="toggleEditMode"></q-btn>
    <q-list v-if="!editModeToggle">
      <q-item v-for="h, index in logs" :key="index">
        <q-item-section>
          <q-item-label> {{ h.dateValue.toLocaleDateString() }}</q-item-label>
        </q-item-section>
        <q-item-section>
          <q-item-label> completion entries: {{ h.completionEntries ? h.completionEntries.length : 0 }}</q-item-label>
        </q-item-section>
        <q-item-section>
          <q-item-label> sample size: {{  h.sampleRate }}</q-item-label>
        </q-item-section>
        <q-item-section>
          <q-item-label> done: {{ h.totalCompletedHabits }}</q-item-label>
        </q-item-section>
      </q-item>
    </q-list>
    <q-list v-else>
      <q-item v-for="h in logs" :key="h.title">
        <q-item-section>
          <q-item-label> edit mode: {{ h.logDate }}</q-item-label>
        </q-item-section>
        <q-item-section>
          <q-item-label> {{ h.completionEntries ? h.CompletionEntries.length : 0 }}</q-item-label>
        </q-item-section>
        <q-item-section>
          <q-btn icon="delete" @click="deleteEntry(h)" color="negative"/>
        </q-item-section>
      </q-item>
    </q-list>
  </div>
  
</template>

<script lang="ts">
import { mapRepos } from 'pinia-orm';
import CompletionEntry from 'src/stores/completion/completion';
import DailyLog from 'src/stores/daily-log/daily-log'
import { Habit } from 'src/stores/habit/habit';
import { PropType, defineComponent, ref } from 'vue';
export default defineComponent({
  name: 'CompletionEntryCard',
  props: {
    title: {
      type: String,
      default: 'Completion Entries'
    },
    logs: {
      type: Array as PropType<DailyLog[]>,
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
      dailyLogRepo: DailyLog,
      completionEntryRepo: CompletionEntry
    }),
    latestLog() {
      return this.dailyLogRepo.orderBy('logDate', 'desc').limit(1)
    }
  },
  methods: {
    async deleteEntry(entry: DailyLog) {
      console.log("delete item id: ", entry.id)
      let result;
      if(entry.id != null) {
        result = await this.dailyLogRepo.piniaStore().axios_deleteItem(entry.id)
        console.log("result: ", result)
        this.dailyLogRepo.piniaStore().axios_getAll()
      }
    },
    toggleEditMode() {
      this.editModeToggle = !this.editModeToggle
      console.log("edit mode is now ", this.editModeToggle ? "enabled" : "disabled")
    }
  }
})
</script>