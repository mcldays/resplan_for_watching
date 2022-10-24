<template>
  <v-app>
    <div class="mainContain">
      <div class="image">
        <v-img
        src="@/assets/icons/cube_animated.svg"
        min-height="600px"
        min-width="600px"
        />
      </div>
      <v-form @keyup.enter.native="authorization" ref="form" @submit.prevent="authorization" style="margin: auto 200px auto 200px; ">
      <div class="reg">
          <v-sheet
              style="position:relative;"
              elevation="20"
              height="700"
              width="470"

          >
            <div style="padding: 40px 20px 20px 30px;">
            <div class="mainText">
              <v-img
                  contain
              src="@/assets/icons/rosneft_logo.svg"
              height="200"
              width="500"
              />
            <div class="title font-weight-light" style="margin-top: 20px">Войти, чтобы продолжить </div>
            </div>
            <div class="fields">
              <v-text-field
                  v-model="login"
                  label="Логин"
                  required
                  :rules="loginRules"
                  outlined
                  hide-details
                  append-icon="mdi-account-box"
              ></v-text-field>

              <v-text-field
                  style="margin-top: 10px"
                  required
                  :rules="pasRules"
                  v-model="password"
                  type="password"
                  label="Пароль"
                  outlined
                  hide-details
                  append-icon="mdi-lock"
              ></v-text-field>
                <div class="login">
              <v-checkbox
                label="Запомнить меня"
                hide-details
                style="margin-top: 0px!important;"
              />
                  <v-btn @click="validate" rounded>
                    Войти
                  </v-btn>
                </div>
              </div>
              <div class="registration">
                <div class="font-weight-light">
                  Все еще нет аккаунта? <a @click="openReg">Зарегистрироваться</a>
                </div>
              </div>
            </div>
          </v-sheet>
      </div>
      </v-form>
    </div>
    <Registration :v-model="regState" @closeModal="closeModal"/>
    <v-snackbar
        v-model="snackbar"
        :timeout="2000"
        right
    >
      Неверное имя пользователя или пароль
    </v-snackbar>
  </v-app>
</template>

<script lang="ts">
import {Component, Vue} from "vue-property-decorator";
import Registration from "@/components/Autorization/Registration.vue";
@Component({
  components:{
    Registration

  }
})

export default class Authorization extends Vue {
  private login  = ""
  private password  = ""
  private snackbar = false;
  private regState = false

  private loginRules : [((v: any) => boolean | string)] = [
    (v:any)=> !!v || "Необходимо для заполнения"
  ]

  private pasRules : [((v: any) => boolean | string)] = [
    (v:any)=> !!v || "Необходимо для заполнения"
  ]

  async authorization(){
    let login = this.login
    let password = this.password

    await this.$store.dispatch('login', { login, password }).then(()=>
        {
          this.$router.push("/diagrams")
          //let strChapters = window.localStorage.getItem("availableChapters");
          //let chapters = strChapters != undefined ? JSON.parse(strChapters) : ["aut"];
          //if(chapters.includes("transportations"))
            //this.$router.push('/Transportations')
          //else
            //this.$router.push('/' + chapters[0])
        }
    ).catch(()=>{
      this.snackbar =true
    })
    await this.$store.dispatch('reRenderDots')

  }
  openReg(){
    this.regState = !this.regState
  }
  closeModal(){
    this.regState = false
  }

  validate(): void {
    if ((this.$refs.form as Vue & { validate: () => boolean }).validate()) {
      this.authorization()
    }
  }
}

</script>

<style scoped>
.mainContain{
  justify-content: space-between;
  width: 90%;
  height: 90%;
  display: flex;
  margin: auto auto auto 200px;

}
.vrowStyle{
  padding: 0 50px 0 0;
}
.image{
  margin: auto;
}
.registration{
  position: absolute;
  text-align: center;
  bottom: 0;
  left: 17%;
  margin-bottom: 10px;
}
.mainText{
  padding: 30px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.fields{
  padding: 0 50px 0 50px;
}
.login{
  display: flex;
  justify-content: space-between;
  margin-top: 10px;

}
.v-text-field{
  padding: 5px
}

.v-input{
  padding: 5px 0px!important;
}
</style>