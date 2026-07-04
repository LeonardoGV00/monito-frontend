import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './style.css'
import PrimeVue from 'primevue/config'
import Material from '@primeuix/themes/material'
import 'primeicons/primeicons.css'
import 'primeflex/primeflex.css'

import Button from 'primevue/button'
import Card from 'primevue/card'
import Avatar from 'primevue/avatar'
import Dialog from 'primevue/dialog'
import Dropdown from 'primevue/dropdown'
import Menubar from 'primevue/menubar'
import Divider from 'primevue/divider'

createApp(App)
  .use(router)
  .use(PrimeVue, { ripple: true, theme: { preset: Material } })
  .component('pv-button', Button)
  .component('pv-card', Card)
  .component('pv-avatar', Avatar)
  .component('pv-dialog', Dialog)
  .component('pv-dropdown', Dropdown)
  .component('pv-menubar', Menubar)
  .component('pv-divider', Divider)
  .mount('#app')
