<template>
  <q-page padding>
    <daily-log-card
      title="All Daily Logs"
      :logs="useDailyLogsStore().getAll()"
    />
  </q-page>
</template>

<script setup lang="ts">
import DailyLogCard from 'src/components/DailyLogCard.vue'
import { useDailyLogsStore } from 'src/stores/dailyLog/dailyLogStore'
</script>
