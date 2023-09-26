<template>
  <q-page padding>
    <user-list-card title="All Users" :users="users"></user-list-card>
  </q-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import UserListCard from 'src/components/UserListCard.vue'
import { User, useUsersStore } from '@/stores/user/userStore'
export default defineComponent({
  name: 'SuperPage',
  components: {
    UserListCard,
  },
  computed: {
    users(): User[] {
      return useUsersStore().getAll()
    },
  },
})
</script>
