<template>
  <div style="position: relative">
    <router-view :key="renderDots"></router-view>
<!--      <v-scroll-y-reverse-transition mode="out-in">-->
    <div class="notifyHub" style="display: block">
    <div v-for="error in errors" :key="error.text">
       <ErrorMessage  :text="error" v-if="vision" />
      <v-btn 
        style="position: absolute; top:0; right:0; display:flex; background-color: #ff033e;" 
        depressed 
        small 
        v-if="vision" 
        @click="closeMessage(error)" 
        icon><v-icon class="mx-2">mdi-close-circle</v-icon>
      </v-btn>
    </div>
    </div>
<!--      </v-scroll-y-reverse-transition>-->
  </div>
</template>

<script lang="ts">

import {Component, Prop, Vue, Watch} from 'vue-property-decorator'
import MainMenu from "@/components/GlobalForms/MainMenu.vue";
import Preloader from "@/ui/Preloader.vue";
import eventBus from "../eventBus";
import router from '@/router'
import Axios from '@/../axios_settings'
import NotificationHub from "@/views/NotificationHub.vue";
import store from "@/store";
import ErrorMessage from "@/views/ErrorMessage.vue";




@Component({
  components:{
    NotificationHub,
    ErrorMessage
  },
})
export default class App extends Vue {
  private text = ""
  private type = ""
  private vision = false
  private mainContain = false
  private renderDots = 0
  private errors = [] as any




  async created() {

    //применение темнйо или светлой темы
    let theme = (localStorage.getItem('mythemeCache') === 'true')
    //console.log(theme)
    this.$vuetify.theme.dark = theme

    await this.$store.dispatch('reRenderDots')
    Vue.prototype.$http.interceptors.response.use(undefined, (err: any) => {
      return new Promise((resolve, reject) => {
        if (err.response && err.response.status === 401 && err.config && !err.config.__isRetryRequest) {

          this.$store.dispatch("logout");
          this.$router.push("/aut")
        }
        throw err;
      });
    })


    Vue.prototype.$http.interceptors.response.use(undefined, (err:any) =>{
      this.vision = true
      this.text = err.response.data
      this.errors.push(err.response.data)
    })

  }

  closeMessage(error: any) {
    this.vision = false
    let index = this.errors.indexOf(error)
    this.errors.splice(index)
  }


  @Watch('$route.path')
  check() {
    Vue.prototype.$http.interceptors.response.use(undefined, (err:any) =>{
      return new Promise((resolve, reject) => {
        if (err.response && err.response.status === 401 && err.config && !err.config.__isRetryRequest) {

          this.$store.dispatch("logout");
          this.$router.push("/aut")
        }
        throw err;
      });
    })
    this.$store.dispatch('reRenderDots')


    if (store.getters.isLoggedIn) {
      this.mainContain = true
    } else {
      this.mainContain = false
    }
  }
    stop(){
      this.vision = false
      this.text = ""
      this.type = ""
    }
}

</script>
<style>
.notifyHub{
  position: fixed;

  right: 1%;
  bottom: 1%;
  z-index: 999;
  max-width: 40%;
}
</style>
