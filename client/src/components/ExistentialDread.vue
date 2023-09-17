<template>
  <div class="clock">
    <p>{{ currentTime.toLocaleTimeString() }}</p>
  </div>
</template>

<script lang="ts">
import DailyLog from 'src/stores/daily-log/daily-log';
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'ExistentialDread',
  data() {
    return {
      currentTime: new Date()
    };
  },
  mounted() {
    setInterval(() => {
      this.currentTime = new Date()
    }, 1000)
  }
})
</script>

<style scoped>
.clock {
  font-size: 24px;
  text-align: center;
}
</style>
