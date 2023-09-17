<template>
  <q-page padding>
    <daily-log-card title="All Daily Logs" :logs="logs"></daily-log-card>
  </q-page>
</template>

<script setup lang="ts">
import { useRepo } from 'pinia-orm';
import DailyLog from 'src/stores/daily-log/daily-log';
import { ref } from 'vue';
import DailyLogCard from 'src/components/DailyLogCard.vue';
import CompletionEntry from 'src/stores/completion/completion';
import TheGreatHydrator from 'src/stores/TheGreatHydrator';
import { User } from 'src/stores/user/user';
import { Habit } from 'src/stores/habit/habit';

const logRepo = useRepo(DailyLog)
await TheGreatHydrator.hydratify([
  logRepo, 
  useRepo(CompletionEntry), 
  useRepo(User), 
  useRepo(Habit)])
const reloadList = () => logRepo.withAll().get()

const logs = ref<Array<DailyLog>>([...reloadList()])

const updateLogs = () => {
  console.log("updating logs.")
  logs.value = reloadList()
  setTimeout(updateLogs, 5000)
}

updateLogs()

</script>
