<script setup lang="ts">
import { useFoodItemStore } from 'src/stores/foodItem/foodItemStore'
import { useRouter } from 'vue-router'
const router = useRouter()
const redirectToForm = () => {
  router.push('new-food-item')
}
</script>

<template>
  <q-page padding>
    <q-list>
      <q-item v-for="(f, i) in useFoodItemStore().getAll()" :key="i">
        <q-item-section>{{ f.name }}</q-item-section>
        <q-item-section
          >{{ f.caloriesPerUnit }} calories per {{ f.unit }}</q-item-section
        >
      </q-item>
    </q-list>
    <q-page-sticky position="bottom-right" :offset="[18, 18]">
      <q-btn fab icon="add" color="accent" @click="redirectToForm" />
    </q-page-sticky>
  </q-page>
</template>
