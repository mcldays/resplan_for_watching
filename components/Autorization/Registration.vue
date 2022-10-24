<template>
  <v-dialog
      width="600px"
      style="height: auto"
      v-model="regState"
      @keydown.esc="closeModal"
  >
    <v-card>
      <v-card-title>

        Регистрация

      </v-card-title>
      <v-divider></v-divider>
      <div class="mainContain">
      <v-form
          ref="form"
          v-model="valid"
          lazy-validation
      >
        <v-avatar
            color="primary"
            size="100"
            class="avatar"
        >
          <v-icon dark x-large>
            mdi-account-circle
          </v-icon>

        </v-avatar>
        <v-text-field
            append-icon="mdi-account-box"
            v-model="regModel.fLogin"
            :rules="regModelRules"
            label="Логин"
            required
        ></v-text-field>

        <v-text-field
            append-icon="mdi-account-box-multiple"
            v-model="regModel.fName"
            :rules="regModelRules"
            label="Имя"
            required
        ></v-text-field>

        <v-text-field
            append-icon="mdi-at"
            v-model="regModel.fEmail"
            :rules="emailRules"
            label="E-mail"
            required
        ></v-text-field>

        <v-text-field
            append-icon="mdi-lock"
            v-model="regModel.Password"
            :rules="regModelRules"
            label="Пароль"
            required
            type="password"
        ></v-text-field>

        <v-text-field
            append-icon="mdi-lock-reset"
            label="Повторите пароль"
            :rules="passwordRules"
            required
            type="password"
        ></v-text-field>

        <v-text-field
            append-icon="mdi-bullhorn"
            v-model="regModel.fDescription"
            label="Описание"
        ></v-text-field>

        <div style="display: flex; justify-content: space-between;">
          <v-btn
              color="error"
              class="mr-4"
              @click="closeModal"
          >
            Отмена
          </v-btn>

          <v-btn
              color="success"
              class="mr-4"
              @click="validate"
              :disabled="!valid"
          >
            Зарегистрироваться
          </v-btn>
        </div>
      </v-form>
      </div>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import {Component, Prop, Vue, Watch} from "vue-property-decorator";
import {accountModel} from "@/models/accountModel";
import {autController} from "@/controllers/autController";
@Component({
  components:{

  },
})

export default class Authorization extends Vue {
  @Prop({default: false}) vModel: any

  private regState = false
  private regModel = {} as accountModel
  private regModelRules : [((v: any) => boolean | string)] = [
    (v:any)=> !!v || "Необходимо для заполнения"
  ]
  private emailRules : [((v :any) => boolean | string), ((v:any) => boolean | string)] = [
    v => !!v || 'Необходимо для заполнения',
    v => /.+@.+\..+/.test(v) || 'Неверный формат Email'
  ]
  private passwordRules : [((v :any) => boolean | string)] = [
      v => v===this.regModel.Password || "Пароли не совпадают"
  ]
  private valid = false



  @Watch("vModel", {deep: true})
  openDialog() {
    this.regState = this.vModel
  }
  closeModal(){
    this.$emit("closeModal");
    ((this.$refs.form as Vue & { reset: () => boolean }).reset())
    this.regModel = {} as accountModel
  }


  async registration(){
    await autController.Registration(this.regModel).then(this.success).catch(this.error)
  }
  error(e : any){
    this.$emit("notifyStart", {text : e, type: "error"})
  }
  async success(){
    let login  = this.regModel.fLogin
    let password = this.regModel.Password
    this.regState = false
    await this.$store.dispatch('login', { login, password }).then(()=>
    {
      this.$router.push("/contracts")

    })
  }
  validate(): void {
    if((this.$refs.form as Vue & { validate: () => boolean }).validate()){
      this.registration()
    }
  }


}
</script>
<style scoped>
.mainContain{
  width: 90%;
  height: 90%;
  padding: 50px;
  margin: auto;
}
.avatar{
  margin-left: auto;
  margin-right: auto;
  display: block;

}
</style>