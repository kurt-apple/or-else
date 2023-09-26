<template>
  <q-page padding>
    <daily-log-card title="All Daily Logs" :logs="logs"></daily-log-card>
  </q-page>
</template>

<script setup lang="ts">
import { DailyLog, useDailyLogsStore } from 'src/stores/daily-log/daily-log-store';
import { ref } from 'vue';

const logRepo = useDailyLogsStore()

const logs = ref<Array<DailyLog>>([...logRepo.getAll()])

</script>
