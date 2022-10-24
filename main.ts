import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import vuetify from './plugins/vuetify'
import Axios from '@/../axios_settings'
import EventBus from "vue-bus-ts";

router.beforeEach((to, from, next) => {
  store.dispatch('reRenderDots').then(()=>{
    const dots = store.getters.getUpLevelDots
    if (!(dots.filter((e: any) => e.href === to.path).length > 0)) {
      next('/405')
      //return
    }
    else{
      next()
    }

  })
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (store.getters.isLoggedIn) {
      next()
      return
    }

    next('/aut')
  } else {
    next()
  }

})




// Axios.interceptors.response.use(function (response){
//       return response
//     }, function (error) {
//
//           store.dispatch('logout')
//
//     }
// )



Vue.use(EventBus)
const bus = new EventBus.Bus()
Vue.prototype.$http = Axios
Vue.config.productionTip = false
Vue.config.devtools = true
new Vue({
  router,
  store,
  vuetify,
  bus,
  render: h => h(App)
}).$mount('#app')


