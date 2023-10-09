<script setup lang="ts">
import {
  CompletionEntry,
  habitStatus,
} from 'src/stores/completion/completionStore'
import { DailyLog, useDailyLogsStore } from 'src/stores/dailyLog/dailyLogStore'
import { useHabitsStore } from 'src/stores/habit/habitStore'
import { computed } from 'vue'
import CompletionEntryTreeNode from 'src/components/CompletionEntryTreeNode.vue'
import DailyLogTreeNode from 'src/components/DailyLogTreeNode.vue'

const dailyLogStore = useDailyLogsStore()
const habitsStore = useHabitsStore()
// todo make computed
const treePayload = computed(() => {
  return dailyLogStore.allDesc().map((x) => ({
    label: new Date(x.logDate).toLocaleDateString(),
    type: 'date',
    obj: x,
    children: dailyLogStore
      .getCompletionEntries(x.id)
      .map((y: CompletionEntry) => ({
        label:
          (y.habitID ?? 'undefined').toString() +
          ': ' +
          habitsStore.getByID(y.habitID)?.title +
          ': ' +
          (y.status === habitStatus.COMPLETED ? 'COMPLETED' : 'INCOMPLETE'),
        status: y.status,
        type: 'entry',
        obj: y as CompletionEntry,
      })),
  }))
})
const resample = async () => {
  const firstEntry = dailyLogStore.allAsc()[0]
  await dailyLogStore.reSample(firstEntry)
}
</script>

<template>
  <q-page>
    <h4>Daily Logs</h4>
    <q-btn @click="resample()">REFRESH</q-btn>
    <q-tree :nodes="treePayload" node-key="label">
      <template #default-header="prop">
        <completion-entry-tree-node
          v-if="prop.node.type === 'entry'"
          :entry="(prop.node.obj as CompletionEntry)"
        />
        <daily-log-tree-node
          v-if="prop.node.type === 'date'"
          :log="(prop.node.obj as DailyLog)"
        />
      </template>
    </q-tree>
  </q-page>
</template>
