<script setup lang="ts">
import { ref } from 'vue'
import EssentialLink from 'components/EssentialLink.vue'
import ExistentialDread from 'components/ExistentialDread.vue'
import { DailyLog, useDailyLogsStore } from 'src/stores/dailyLog/dailyLogStore'
import { User, useUsersStore } from 'src/stores/user/userStore'
import Utils from 'src/util'
import TheGreatHydrator from 'src/stores/TheGreatHydrator'

const linksList = [
  {
    title: 'Dashboard',
    icon: 'space_dashboard',
    link: '/dashboard',
  },
  {
    title: 'Daily Logs',
    icon: 'view_agenda',
    link: '/daily-logs',
  },
  {
    title: 'Food Logs',
    icon: 'tapas',
    link: '/food-logs',
  },
  {
    title: 'Food Items',
    icon: 'list',
    link: '/food-items',
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
    link: 'super',
  },
]

await TheGreatHydrator.brrrrr()
const leftDrawerOpen = ref(false)

const checkTime = async () => {
  const currentTime = new Date()
  const repo = useDailyLogsStore()
  const user: User = Utils.hardCheck(
    useUsersStore().defaultUser(),
    'default user not found'
  )
  let latestLog = Utils.hardCheck(
    repo.latestLog(user.id),
    'latest log for default user was not found'
  )
  let latestLogTime = Utils.d(latestLog.logDate)
  // console.log('latestlogtime: ', latestLogTime, ' is type of: ', typeof latestLogTime)
  while (currentTime.getDate() !== latestLogTime.getDate()) {
    console.log(
      "conditions were met, we're adding a log. latest log id is ",
      latestLog.id
    )
    const newLog = new DailyLog({
      previousLogID:
        typeof latestLog !== 'undefined' ? latestLog.id : undefined,
      userID: latestLog.userID,
      logDate: new Date(latestLogTime.getTime() + 86400000).toISOString(),
    })
    await repo.createItem(newLog)
    latestLog = Utils.hardCheck(
      repo.latestLog(user.id),
      'latest log for default user was not found'
    )
    latestLogTime = Utils.d(latestLog.logDate)
  }
  setTimeout(checkTime, 10000)
}

await checkTime()

const toggleLeftDrawer = () => {
  leftDrawerOpen.value = !leftDrawerOpen.value
}
</script>

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

        <q-toolbar-title> OR ELSE </q-toolbar-title>

        <existential-dread></existential-dread>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
      <existential-dread></existential-dread>
      <q-list>
        <EssentialLink
          v-for="link in linksList"
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
