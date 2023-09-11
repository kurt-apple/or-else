<template>
  <div class="clock">
    <p>{{ currentTime }}</p>
  </div>
</template>

<script>
export default {
  data() {
    return {
      currentTime: new Date().toLocaleTimeString(),
    };
  },
  mounted() {
    // Update the current time every second
    setInterval(() => {
      this.currentTime = new Date().toLocaleTimeString();
    }, 1000);
  },
};
</script>

<style scoped>
.clock {
  font-size: 24px;
  text-align: center;
}
</style>
