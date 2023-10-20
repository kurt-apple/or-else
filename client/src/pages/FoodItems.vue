<script setup lang="ts">
import { useQuasar } from 'quasar'
import FoodItemDialog from 'src/components/dialog/FoodItemDialog.vue'
import { FoodItem, useFoodItemStore } from 'src/stores/foodItem/foodItemStore'

const fis = useFoodItemStore()

const addFoodItem = async (item: FoodItem) => {
  await fis.createItem(item)
}

const $q = useQuasar()
const addFoodItemDialog = (fi: FoodItem | null) => {
  console.log('add food item dialog')
  $q.dialog({
    component: FoodItemDialog,
    componentProps: {
      foodItem: fi,
      mode: 'create',
    },
  })
    .onOk(async (action: { item: FoodItem; unsaved: boolean }) => {
      console.log('create habit on OK', action.item)
      if (fi === null) await addFoodItem(action.item)
      else await fis.updateItem(action.item)
    })
    .onCancel(() => {
      console.log('Cancel')
    })
    .onDismiss(() => {
      console.log('Dismissed Dialog')
    })
}
</script>

<template>
  <q-page padding>
    <q-list>
      <q-item v-for="(f, i) in useFoodItemStore().getAll()" :key="i">
        <q-item-section>
          <q-btn icon="info" @click="addFoodItemDialog(f)" />
        </q-item-section>
        <q-item-section>{{ f.name }}</q-item-section>
        <q-item-section
          >{{ f.caloriesPerUnit }} calories per {{ f.unit }}</q-item-section
        >
      </q-item>
    </q-list>
    <q-page-sticky position="bottom-right" :offset="[18, 18]">
      <q-btn fab icon="add" color="accent" @click="addFoodItemDialog(null)" />
    </q-page-sticky>
  </q-page>
</template>
