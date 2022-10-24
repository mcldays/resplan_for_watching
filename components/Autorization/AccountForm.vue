<template>
  <!-- 0 Личные настройки -->
    <div>
      <v-card class="ma-2" max-width="35%">
        <v-card-title><v-icon class="mx-2">mdi-account-details</v-icon>Ваши данные</v-card-title>
        <v-card-text>
          <div style="display: flex;">
            <div>
              <v-avatar class="ma-2" size="120" :rounded="true">
                <div>
                  <v-icon style="position: absolute; align: right" color="blue" x-large>mdi-pencil-outline</v-icon>
                  <img :src="smallAva" alt="none" @click="handleFileImport">
                </div>
              </v-avatar>
              <div v-if="isNewAvatar">
                Предпросмотр
                <v-avatar class="ma-2" size="120" :rounded="true"><img :src="croppedResult" alt="none"></v-avatar>
              </div>
              <input 
                ref="uploader" 
                class="d-none" 
                type="file" 
                @change="loadAvatarPicture"
              />
            </div>
            <div style="width:100%">
              <v-text-field v-model="UserLogin" label="Логин" class="pa-2" dense outlined hide-details disabled prepend-icon="mdi-account-circle"/>
              <v-text-field v-model="UserName" label="Имя" class="pa-2" dense outlined hide-details prepend-icon="mdi-pencil-outline" @input="isNeedSave"/>
              <v-text-field v-model="UserEmail" label="Почта" class="pa-2" dense outlined hide-details prepend-icon="mdi-pencil-outline" @input="isNeedSave"/>
              <v-textarea v-model="UserDescription" label="Описание" class="pa-2" dense outlined rows="1" auto-grow hide-details hide-spin-buttons prepend-icon="mdi-pencil-outline" @input="isNeedSave"/>
            </div>
          </div>
            <v-dialog
              v-model="cropDialog"
              v-if="cropDialog"
              transition="dialog-bottom-transition"
              width="auto"
              max-width="60%"
              max-height="80%"
            >
              <v-card>
                <v-card-title>
                  <v-icon class="mx-2">mdi-image-area</v-icon>Выделение области
                  <v-spacer/>
                  <v-btn class="mx-2" right x-large color="green" @click="cropImage" icon><v-icon class="mx-2">mdi-checkbox-outline</v-icon></v-btn>
                  <v-btn class="mx-2" right x-large color="red" @click="cropDialog = false" icon><v-icon class="mx-2">mdi-close-box-outline</v-icon></v-btn>
                </v-card-title>
                <v-card-text>
                  <vue-cropper
                    ref="cropper"
                    alt="Source Image"
                    :aspect-ratio="1"
                    :view-mode="2"
                  />
                </v-card-text>
              </v-card>
            </v-dialog>
          <div style="display: flex;" class="ma-2">
              <v-btn class="mx-2" depressed color="primary" @click="stateChangePassEvent">{{this.stateChangePassLebel}}</v-btn>
              <div v-if="stateChangePass" style="display: flex;">
                <v-text-field class="mx-2" v-model="myNewPass" label="Новый пароль" outlined dense hide-details type="password" @input="clearNotify"/>
                <v-text-field class="mx-2" v-model="myNewPassCopy" label="Повтор пароля" outlined dense hide-details type="password" @input="clearNotify"/>
                <v-btn class="mx-2" depressed color="green" @click="changeMyPass">ОК</v-btn>
              </div>
              <div v-if="saveState || isNewAvatar" style="display: flex; z-index: 999;" class="mx-2">
              <v-btn class="mx-2" depressed color="primary" @click="saveChanges">Сохранить</v-btn>
              <v-btn class="mx-2" depressed color="error" @click="cancelChanges">Отмена</v-btn>
              </div>
          </div>
        </v-card-text>
      </v-card>
      <v-card class="ma-2" max-width="35%">
        <v-card-title><v-icon class="mx-2">mdi-tune-variant</v-icon>Настройки стиля</v-card-title>
        <v-card-text>
          <!--<v-combobox outlined class="ma-2" v-model="persFontSize" label="Размер шрифта" :items="['Маленький','Средний','Большой']" @change="isNeedSave" dense/>-->
          <v-combobox outlined class="ma-2" v-model="persColor" label="Цветовая схема" :items="['Светлый','Темный']" @change="isNeedSave" dense/>    
        </v-card-text>
      </v-card>
      <v-card class="ma-2" max-width="35%">
        <v-card-title><v-icon class="mx-2">mdi-account-filter</v-icon>Ваши привилегии</v-card-title>
        <v-card-text>
          <v-expansion-panels>
            <v-expansion-panel>
              <v-expansion-panel-header>Доступ к Компаниям</v-expansion-panel-header>
              <v-expansion-panel-content>
                <v-data-table :headers="CompaniesHeader" :items="Companies"/>
              </v-expansion-panel-content>
            </v-expansion-panel>
            <v-expansion-panel>
              <v-expansion-panel-header>Доступ к Контрольным точкам</v-expansion-panel-header>
              <v-expansion-panel-content>
                <v-data-table :headers="CPHeader" :items="CP"/>
              </v-expansion-panel-content>
            </v-expansion-panel>
          </v-expansion-panels>
        </v-card-text>
      </v-card>

      <div v-if="notify">
        <notification-hub
          :text="notifyText"
          :state="notify"
          :timeout="2000"
          :backgroundColor="notifyError ? 'red' : 'green'"
        />
      </div>
    
      <!--div v-if="saveState" style="display: flex; position: bottom: 0; z-index: 999" class="pa-5 lighten-4">
          <v-btn depressed color="primary" @click="saveChanges">Сохранить</v-btn>
      </div-->
    </div>
</template>


<script lang="ts">
import {Component, Prop} from 'vue-property-decorator'
import {mixins} from "vue-class-component";
import {tableMixin} from "@/mixins/tableMixin";
import {autController} from "@/controllers/autController";
import {baseController} from "@/controllers/baseController";
import VueCropper from 'vue-cropperjs'
import 'cropperjs/dist/cropper.css';
import NotificationHub from "@/views/NotificationHub.vue";


@Component({
  components: { VueCropper, NotificationHub }
})
export default class AccountForm extends mixins(tableMixin) {

  //Accout form
  private smallAva = ''
  private UserLogin = 'none'
  private UserName = 'none'
  private UserDescription = 'none'
  private UserEmail = 'none'
  private myNewPass = ""
  private myNewPassCopy = ""
  private stateChangePass = false
  private stateChangePassLebel = 'Сменить пароль'
  private UserKey = 0

  //Personal Params
  private persFontSize = "Средний"
  private persColor = "Светлый"
  private saveState = false

  //Rules
  private CompaniesHeader: any[] = []
  private Companies: any[] = []
  private CP: any[] = []
  private CPHeader = [
    { text: 'Тип доступа', value: 'fAccessType' },
    //{ text: 'Ключ', value: 'f_spControlPoints' },
    { text: 'Наименование', value: 'fName' },
  ]

  // avatar
  private isSelecting = false
  private isNewAvatar = false
  private croppedResult:any = null
  private cropDialog = false

  // notify
  private notify = false
  private notifyError = false
  private notifyText = ""

  async created() {
    this.LoadAccountInfo()
    this.persColor = this.$vuetify.theme.dark ? 'Темный' : 'Светлый'
  }

  async LoadAccountInfo()
  {
    const result = await autController.getUserInfo()    
    this.UserLogin = result.data[0].fLogin
    this.UserName = result.data[0].fName
    this.UserDescription = result.data[0].fDescription
    this.UserEmail = result.data[0].fEmail
    this.UserKey = result.data[0].fkey
    this.smallAva = await autController.getAvatarFromTable(result.data[0].f_spFiles)
    //companyes
    const resultComp = await autController.getUserCompany()
    let dtComp = this.preparedDataToTable(resultComp)
    this.CompaniesHeader = dtComp.headersTable
    this.Companies = dtComp.valuesTable
    //controlPoints
    const resultCP = await autController.getUserControlPoints()
    this.CP = resultCP.data
  }

  stateChangePassEvent() {
    this.clearNotify()
    this.myNewPass = ""
    this.myNewPassCopy = ""
    this.stateChangePass = !this.stateChangePass
    this.stateChangePassLebel = this.stateChangePass?'Отмена':'Сменить пароль'
  }

  async changeMyPass() {
    if (this.myNewPass !== "") {
      if (this.myNewPass === this.myNewPassCopy) {
        baseController.changePassword(-1, this.myNewPass)
        this.stateChangePassEvent()
        this.notifyError = false
        this.notify = true
        this.notifyText = 'Пароль изменён!'
      } else 
      { 
        this.notifyError = true
        this.notify = true
        this.notifyText = 'Новый пароль и повтор нового пароля не совпадают!'
      }
    } else 
    { 
      this.notifyError = true
      this.notify = true
      this.notifyText = 'Нельзя сменить пароль на пустой!'
    }
  }

  // загрузка изображения в cropper
  loadAvatarPicture(e: any) {
    this.notify = false
    const file = e.target.files[0];
    if (file.type.indexOf('image/') === -1) {
        this.notifyError = true
        this.notify = true
        this.notifyText = 'Выберите файл-изображение!'
        return;
      }
    if (typeof FileReader === 'function') {
      const reader = new FileReader();
      reader.onload = (event) => {
        (this.$refs.cropper as any & { replace: (arg0: any) => boolean }).replace(event.target?.result);
      };
      reader.readAsDataURL(file);
      this.cropDialog = true
    } else {
      //alert('FileReader API не поддерживается');
      this.notifyError = true
      this.notify = true
      this.notifyText = 'FileReader API не поддерживается'
    }
  }

  // обрезка изображения
  cropImage() {
    this.croppedResult = ((this.$refs.cropper as any).getCroppedCanvas({width: 100, height: 100,}) as any).toDataURL()
    this.cropDialog = false
    this.isNewAvatar = true
  }

  // сохранить новую аватарку
  async saveAvatar() {
    let blob = new Blob();
    await fetch(this.croppedResult)
      .then(res => res.blob())
      .then(res => blob = res)
    const formData: FormData = new FormData()
    formData.append('file', blob, "avatar" + this.UserKey) 
    await autController.setUserAvatar(this.UserKey, formData)
    this.smallAva = this.croppedResult
    this.isNewAvatar = false
  }

  // хитрая реализация выбора файла по клику
  handleFileImport() {
    this.isSelecting = true;

    window.addEventListener('focus', () => {
        this.isSelecting = false
    }, { once: true });
    
    (this.$refs.uploader as HTMLElement).click();
  }

  isNeedSave(item:any) {
    this.notify = false
    this.saveState = true
    console.log("item",item)
    if (item == "Светлый") { 
      this.$vuetify.theme.dark = false 
      localStorage.setItem('mythemeCache', 'light');
    } else if (item == "Темный") { 
      this.$vuetify.theme.dark = true
      localStorage.setItem('mythemeCache', 'dark');
    }
  }

  clearNotify()
  {
    this.notify = false
  }

  // сохранить изменения
  async saveChanges() {
    if (this.isNewAvatar)
    {
      await this.saveAvatar()
    }
    if (this.saveState)
    {
      let model: any = {}
      model["tblName"] = 'spUsers'
      model["fkey"] = this.UserKey
      model["fName"] = this.UserName
      model["fEmail"] = this.UserEmail
      model["fDescription"] = this.UserDescription
      await baseController.applyTableChanges([model])
    }
    this.saveState = false
    this.notifyError = false
    this.notify = true
    this.notifyText = 'Данные сохранены'
  }

  // отменить изменения
  async cancelChanges() {
    await this.LoadAccountInfo()
    this.croppedResult = null
    this.isNewAvatar = false
    this.saveState = false
  }

}
</script>

<style scoped>

</style>