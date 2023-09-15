<template>
  <div>
    <h1>{{ title }}</h1>
    <q-btn :icon="editModeToggle ? 'visibility' : 'edit'" @click="toggleEditMode"></q-btn>
    <q-list v-if="!editModeToggle">
      <q-item v-for="h, index in completionEntries" :key="index">
        <q-checkbox v-model="h.completed" @click="updateCompletedStatus(h)"></q-checkbox>
        <q-item-section>
          <q-item-label> {{ h.habit?.title ? h.habit.title : 'undefined' }}</q-item-label>
        </q-item-section>
        <q-item-section>
          <q-item-label> {{ h.dailyLog.logDate ? h.dailyLog.logDate : 'undefined' }}</q-item-label>
        </q-item-section>
      </q-item>
    </q-list>
    <q-list v-else>
      <q-item v-for="h in completionEntries" :key="h.title">
        <q-item-section>
          {{  h.complete }}
        </q-item-section>
        <q-item-section>
          <q-item-label> edit mode: {{ h.habit?.title || 'reeeee' }}</q-item-label>
        </q-item-section>
        <q-item-section>
          <q-item-label> {{ h.dailyLog.logDate || 'reeee' }}</q-item-label>
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
    completionEntries: {
      type: Array as PropType<CompletionEntry[]>,
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
    async deleteEntry(entry: CompletionEntry) {
      console.log("delete item id: ", entry.id)
      let result;
      if(entry.id != null) {
        result = await this.completionEntryRepo.piniaStore().axios_deleteItem(entry.id)
        console.log("result: ", result)
        this.completionEntryRepo.piniaStore().axios_getAll()
      }
    },
    toggleEditMode() {
      this.editModeToggle = !this.editModeToggle
      console.log("edit mode is now ", this.editModeToggle ? "enabled" : "disabled")
    },
    async updateCompletedStatus(r: CompletionEntry) {
      console.log("about to update status on ", r)
      if(r.status != 2) r.status = 2
      else r.status = 1
      const result = await this.completionEntryRepo.piniaStore().axios_updateItem(r)
      console.log(`${r.id} status is now ${r.status} - api result: `, result)
    }
  }
})
</script>