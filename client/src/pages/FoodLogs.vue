<script setup lang="ts">
import FoodEntryList from 'src/components/FoodEntryList.vue'
import { useFoodEntryStore } from 'src/stores/foodEntry/foodEntryStore'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
const foodEntryStore = useFoodEntryStore()
const router = useRouter()
const redirectToForm = () => {
  router.push('food-entry')
}
</script>
<template>
  <q-page padding>
    <food-entry-list
      title="All Food Entries"
      :logs="foodEntryStore.getAll()"
    ></food-entry-list>
    <q-page-sticky position="bottom-right" :offset="[18, 18]">
      <q-btn fab icon="add" color="accent" @click="redirectToForm" />
    </q-page-sticky>
  </q-page>
</template>
