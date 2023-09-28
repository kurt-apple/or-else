<script setup lang="ts">
import axios, { AxiosError } from 'axios'
import { useUsersStore } from 'src/stores/user/userStore'
import { ref } from 'vue'

const userStore = useUsersStore()
const user = ref(userStore.gimmeUser())
console.log('default user: ', user)
const saveUserSettings = async () => {
  try {
    await useUsersStore().updateItem(user.value)
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.warn(`Axios Error - ${error.message}`)
      console.log(error)
    } else {
      console.warn(`Error on Axios usage, possibly not Axios fault - ${error}`)
      console.log(error)
    }
  }
}
</script>

<template>
  <q-page padding>
    <br />
    <q-slider
      v-model="user.completionRateThreshold"
      name="Completion Rate Threshold"
      :snap="true"
      :step="0.01"
      :label-always="true"
      :markers="true"
      :min="0.5"
      :max="1.0"
    />
    <q-slider
      v-model="user.startingRation"
      name="Starting Ration"
      :snap="true"
      :step="50"
      :label-always="true"
      :markers="true"
      :min="1400"
      :max="3000"
    />
    <q-btn icon="save" @click="saveUserSettings">Save</q-btn>
  </q-page>
</template>
