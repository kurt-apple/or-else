<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />

        <q-toolbar-title> Quasar App </q-toolbar-title>

        <div>Quasar v{{ $q.version }}</div>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
      <q-list>

        <EssentialLink
          v-for="link in essentialLinks"
          :key="link.title"
          v-bind="link"
        />
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import EssentialLink from 'components/EssentialLink.vue'

const linksList = [
  {
    title: 'Dashboard',
    icon: 'space_dashboard',
    link: '/dashboard',
  },
  {
    title: 'Daily Logs',
    icon: 'view_agenda',
    link: '/logs',
  },
  {
    title: 'Food Logs',
    icon: 'tapas',
    link: '/food-logs',
  },
  {
    title: 'Weight Logs',
    icon: 'monitor_weight',
    link: '/weight-logs',
  },
  {
    title: 'All Habits',
    icon: 'checklist',
    link: '/habits',
  },
  {
    title: 'Settings',
    icon: 'manage_accounts',
    link: 'settings',
  },
  {
    title: 'Super User',
    icon: 'edit',
    link: 'super'
  }
]

export default defineComponent({
  name: 'MainLayout',

  components: {
    EssentialLink,
  },

  setup() {
    const leftDrawerOpen = ref(false)

    return {
      essentialLinks: linksList,
      leftDrawerOpen,
      toggleLeftDrawer() {
        leftDrawerOpen.value = !leftDrawerOpen.value
      },
    }
  },
})
</script>
