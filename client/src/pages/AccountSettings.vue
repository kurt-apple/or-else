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
    <q-btn @click="saveUserSettings" icon="save">Save</q-btn>
  </q-page>
</template>

<script lang="ts">
import { useUsersStore } from '@/stores/user/userStore'
import Utils from '@/util'
import { defineComponent, ref } from 'vue'
export default defineComponent({
  name: 'AccountSettings',
  async setup() {
    const userStore = useUsersStore()
    let user = Utils.hardCheck(
      userStore.defaultUser(),
      'default user was not found'
    )
    console.log('default user: ', user)
    return {
      user: ref(user),
    }
  },
  methods: {
    async saveUserSettings() {
      let result = await useUsersStore().updateItem(this.user)
      console.log(result)
    },
  },
})
</script>
