<template>
  <div class="clock">
    <p>{{ currentTime }}</p>
  </div>
</template>

<script>
import DailyLog from 'src/stores/daily-log/daily-log';
import { mapRepos } from 'pinia-orm';
import { defineComponent } from 'vue';
import CompletionEntry from 'src/stores/completion/completion';

export default defineComponent({
  name: 'ExistendialDread',
  data() {
    return {
      currentTime: new Date().toLocaleTimeString(),
    };
  },
  computed: {
    ...mapRepos({
      dailyLogRepo: DailyLog,
      completionRepo: CompletionEntry
    })
  },
  mounted() {
    // Update the current time every second
    setInterval(() => {
      let now = new Date()
      this.currentTime = now.toLocaleTimeString();
      ///todo: accommodate user timezone if different from currenttime's
      if(now.getHours() === 0 && now.getMinutes === 0 && now.getSeconds === 0) {
        this.dailyLogRepo.piniaStore().axios_getAll()
        let latestLog = this.dailyLogRepo.orderBy('logDate', 'desc').limit(1)
        let yesterday = new Date(now)
        yesterday.setDate(now.getDate() - 1)
        do {
          let newDate = new Date(latestLog.logDate)
          newDate.setDate(latestLog.logDate.getDate() + 1)
          let newLog = this.dailyLogRepo.piniaStore().axios_createItem({
            previousLogId: latestLog.id,
            userId: latestLog.userId,
            logDate: newDate
          }).data
          if(typeof newLog === 'undefined' || newLog == null) {
            throw new Error("Tried to create a Daily Log but it's null or undefined.")
          }
          let sampledHabits = newLog.sampleHabits
          sampledHabits.array.forEach(element => {
            if(typeof element.id === 'undefined' || element.id == null) {
              throw new Error("Sampled Habit ID should not be null or undefined.", element)
            }
            this.completionRepo.piniaStore().axios_createItem({
              habitId: element.id,
              dailyLogId: newLog.id,
              complete: false
            })
          })
          latestLog = this.dailyLogRepo.orderBy('logDate', 'desc').limit(1)
        } while(!(latestLog.logDate >= yesterday.toISOString() && latestLog.logDate < now.toISOString()))
      }
    }, 999);
  },
})
</script>

<style scoped>
.clock {
  font-size: 24px;
  text-align: center;
}
</style>
