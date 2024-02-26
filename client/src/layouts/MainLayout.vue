<script setup lang="ts">
import { ref } from 'vue'
import EssentialLink from 'components/EssentialLink.vue'
import ExistentialDread from 'components/ExistentialDread.vue'
import { DailyLog, useDailyLogsStore } from 'src/stores/dailyLog/dailyLogStore'
import Utils from 'src/util'
import TheGreatHydrator from 'src/stores/TheGreatHydrator'
import { useQuasar } from 'quasar'
import ServerConnectionDialog from 'src/components/dialog/ServerConnectionDialog.vue'

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
]

await TheGreatHydrator.brrrrr()
const leftDrawerOpen = ref(false)

const checkTime = async () => {
  const currentTime = new Date()
  const repo = useDailyLogsStore()
  let latestLog = Utils.hardCheck(repo.latestLog())
  let latestLogTime = Utils.d(latestLog.logDate)
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
    latestLog = Utils.hardCheck(repo.latestLog())
    latestLogTime = Utils.d(latestLog.logDate)
    repo.calculateBaseRation(latestLog)
  }
  setTimeout(checkTime, 10000)
}

await checkTime()

const toggleLeftDrawer = () => {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

const $q = useQuasar()

const serverDialog = () => {
  $q.dialog({
    component: ServerConnectionDialog
  })
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

        <q-space />

        <q-btn
          dense
          flat
          no-wrap
        >
          <q-avatar rounded size="32px">
            <q-icon name="fas fa-settings" />
          </q-avatar>
          <q-menu auto-close>
            <q-list>
              <q-item clickable @click="serverDialog()">
                <q-item-section>Server</q-item-section>
                <q-item-section avatar>
                  <q-icon name="fas fa-sign-out-alt" />
                </q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
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
