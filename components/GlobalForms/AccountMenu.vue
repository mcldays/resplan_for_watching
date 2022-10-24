<template>
  <div class="avatarModal">
    <div class="text-center">
      <v-menu
          nudge-bottom="30"
          v-model="menu"
          :close-on-content-click="false"
          :nudge-width="200"
          offset-x
          open-on-hover
      >
        <template v-slot:activator="{ on, attrs }">
        <div v-if="smallAva != null">
          <v-avatar
              v-bind="attrs"
              v-on="on"
              color="grey darken-1 shrink"
              size="40"
              style="margin-left: 10px; cursor: pointer"
          >
            <img :src="smallAva" alt="none"/>
          </v-avatar>
        </div>
        </template>

        <v-card v-if="smallAva != null">
          <v-list>
            <v-list-item>
              <v-list-item-avatar size="80">
                  <v-avatar size="80">
                    <img :src="smallAva" alt="none">
                  </v-avatar>
              </v-list-item-avatar>

              <v-list-item-content>
                <v-list-item-title> {{this.UserLogin}} </v-list-item-title>
                <v-list-item-title> {{this.UserName}} </v-list-item-title>
                <v-list-item-subtitle> {{this.UserDescription}} </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-list>

          <v-divider></v-divider>

          <v-list>
            <v-list-item link @click="accountForm">
              <v-list-item-icon>
                <v-icon>mdi-account-multiple</v-icon>
              </v-list-item-icon>
              <v-list-item-title>Мой профиль</v-list-item-title>
            </v-list-item>
            <v-list-item @click="logout" link>
              <v-list-item-icon>
                <v-icon>mdi-logout</v-icon>
              </v-list-item-icon>
              <v-list-item-title>Выйти</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-card>
      </v-menu>
    </div>
  </div>
</template>

<script lang="ts">
import Vuex from 'vuex'
import {Component, Prop, Vue} from 'vue-property-decorator'
import store from "@/store";
import {autController} from "@/controllers/autController";

@Component({ components: {}})
export default class AccountMenu extends Vue {
  // Фикс авы
  @Prop({default : ""}) smallAva : string

  menu = false
  private UserLogin = 'none'
  private UserName = 'none'
  private UserDescription = 'none'
  private avaLink = ''

  async created() {
    //Полученние данных учетки из базы
    const result = await autController.getUserInfo()
    this.UserLogin = result.data[0].fLogin
    this.UserName = result.data[0].fName
    this.UserDescription = result.data[0].fDescription.length > 150 ? result.data[0].fDescription.substring(0, 100) + '...' :  result.data[0].fDescription
  }

  async logout(){
    await this.$store.dispatch('logout', ).then(()=>
        this.$router.push('/aut'))
  }
  
  async accountForm(){
    this.$router.push('/accountform')
  }

}
</script>

<style scoped>

</style>