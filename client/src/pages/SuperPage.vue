<script setup lang="ts">
import UserListCard from 'src/components/UserListCard.vue'
import { useUsersStore } from 'src/stores/user/userStore'

const userStore = useUsersStore()
</script>

<template>
  <q-page padding>
    <user-list-card
      title="All Users"
      :users="userStore.getAll()"
    ></user-list-card>
  </q-page>
</template>
