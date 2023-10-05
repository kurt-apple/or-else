<template>
  <q-page padding>
    <daily-log-list
      title="All Daily Logs"
      :logs="useDailyLogsStore().getAll()"
    />
  </q-page>
</template>

<script setup lang="ts">
import DailyLogList from 'src/components/DailyLogList.vue'
import { useDailyLogsStore } from 'src/stores/dailyLog/dailyLogStore'
</script>
