<template>
  <v-app  id="inspire">
    <v-app-bar
        app
        flat

    >
      <a href="/help/" target="_blank">
        <v-avatar
            :color="$vuetify.breakpoint.smAndDown ? 'grey darken-1' : 'transparent'"
            size="50"
            tile
            style="cursor: pointer; margin-right: 10px"
        >
            <img src="@/assets/icons/rosneft_logo.svg">
        </v-avatar>
      </a>
      <v-tabs
          color="grey darken-1"
          :value= activeTab
          hide-slider
      >
        <v-tab
            v-for="(tab,key) in tabs"
            :key="key"
            @click="navigate(tab.href)"
        >
          {{ tab.name }}
        </v-tab>
      </v-tabs>

      <!-- theme slider -->
      <v-spacer/>
      <div class="mx-3">
        <label id="switch" class="switch">
          <input type="checkbox" @click="toggleTheme" :checked="isDay" id="slider">
          <span class="slider round"></span>
        </label>
      </div>

      <!-- Help icon -->
      <v-tooltip bottom>
        <template v-slot:activator="{ on, attrs }">
          <v-btn href="/help/" target="_blank" class="mx-3" icon v-bind="attrs" v-on="on">
            <v-icon color="blue" large>mdi-help-circle-outline</v-icon>
          </v-btn>
        </template>
        <span>Помощь: Инструкция по апробации прототипа модуля «Ресурсный план и портфель заказов КНИПИ»</span>
      </v-tooltip>

      <!-- Company selecter -->
      <v-autocomplete
        v-model="selectedCompany"
        :items="this.Companies"
        item-text="fName"
        item-value="fkey"
        prepend-icon="mdi-account-filter-outline"
        @change="changeCompany"
        class="mx-5"
        hide-details
        hide-no-data
      />

      <!--<v-responsive max-width="260">
        <v-text-field
            dense
            flat
            hide-details
            rounded
            solo-inverted
            prepend-inner-icon="mdi-magnify"
        ></v-text-field>
      </v-responsive>-->

      <AccountMenu :smallAva="this.smallAva"/>
      <div class="borderTab"></div>
    </v-app-bar>
<!--    <v-main class="grey lighten-3">-->

    <v-main>
      <v-container fluid>
        <v-row>
          <v-col>

            <v-fade-transition mode="out-in">
              <router-view  style="margin-top: 5px"   class="main"></router-view>
            </v-fade-transition>

          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>


<script lang="ts">
import {Component, Vue} from 'vue-property-decorator'
import AccountMenu from "@/components/GlobalForms/AccountMenu.vue";
import {baseController} from "@/controllers/baseController";
import {mixins} from "vue-class-component";
import {tableMixin} from "@/mixins/tableMixin";
import {autController} from "@/controllers/autController";

@Component({
  components: {AccountMenu}
})
export default class MainMenu extends mixins(tableMixin) {
  private currentTab: any = 0
  //menu = false

  private tabs: { id: number, name: string, href: string }[] = [
    {id : 0, name:"Диаграммы", href:"/diagrams"},
    {id: 1 , name: "Договоры-аналоги", href: '/contracts'},
    //{id: 15, name: "Распределени расходов", href: '/contracts/restrict/:Pid?'},
    {id: 2 , name: "Портфель заказов", href: '/orderbook'},
    {id: 3 , name: "Балансировка", href: '/orderbalance'},
    {id: 4 , name: "Справочники", href: '/dictories/:Pid?'},
    {id: 5 , name: "Тех. карты", href: '/techcard'},
    {id: 6 , name: "Отчеты", href: '/reports'},
    {id: 7 , name: "Админ Панель", href: '/admin'},
  ]

  private leftMenu: { name: string }[] = [
    {name: "Обратная связь"},
    {name: "Активные договора"},
    {name: "История"}
  ]

  //combo box Companies
  private Companies: any = []
  public selectedCompany:any = []
  private allComlany = { fkey: 0, fName: "Все" }
  private smallAva = ''
  private isDay = false

  get activeTab() {
    let current = this.$router.currentRoute;
    if(current.fullPath == "/"){
      return 0
    }
    let tab = this.tabs.find((t : any)=>t.href.toLowerCase() == current.matched[1].path.toLowerCase())
    if(tab) return tab.id
    return 0
  }


  async created() {
    this.isDay = !this.$vuetify.theme.dark
    await this.$store.dispatch('reRenderDots').then(()=>{
      this.availablePoints()
    }).catch((err)=>{
      console.log(err)
    })
    //console.log(this.$store.getters.getControlDots)

    // загрузка аватарки в Account (фикс)

    const result2 = await autController.getUserInfo()
    this.smallAva = await autController.getAvatarFromTable(result2.data[0].f_spFiles)

    //let result = await baseController.GetDictTable("spCompany")
    const result = await autController.getUserCompany()
    let dataTableParsed = this.preparedDataToTable(result)
    this.Companies = dataTableParsed.valuesTable
    this.Companies.unshift(this.allComlany)
    const selectedCompanyID_str = window.localStorage.getItem("selectedCompanyID")
    const selectedCompanyID = parseInt(selectedCompanyID_str===null?"-1":selectedCompanyID_str);
    if ( selectedCompanyID >= 0 ) {
      const selEl = this.Companies.find((el:any) => el.fkey == selectedCompanyID)
      this.selectedCompany = selEl
    }
    else {
      window.localStorage.setItem('selectedCompanyID', "0")
      this.selectedCompany = this.allComlany
    }
  }

  availablePoints() {
    let points = this.$store.getters.getControlDots
    //console.log(points,"points")
    let availableDots = []
    for (let i = 0; i < points.length; i++) {
      availableDots.push({
        id: i,
        name: points[i].fName,
        href : points[i].href
      })
    }
    //console.log(availableDots,"dots")
    this.tabs = availableDots
  }


  changeCompany() {
    const selectedCompanyID_str = window.localStorage.getItem("selectedCompanyID")
    const selectedCompanyID = parseInt(selectedCompanyID_str===null?"-1":selectedCompanyID_str);
    if (selectedCompanyID !== this.selectedCompany) {
      window.localStorage.setItem('selectedCompanyID', this.selectedCompany)
      window.dispatchEvent(new Event("storage"))
    }
  }

  toggleTheme(){
    localStorage.setItem('mythemeCache', String(!this.$vuetify.theme.dark));
    this.$vuetify.theme.dark = !this.$vuetify.theme.dark
  }

  navigate(href: string): void { 
    let current = this.$router.currentRoute;
    if (current.fullPath !== href)
      this.$router.push(href);
  }
  /*async logout(){
    await this.$store.dispatch('logout', ).then(()=>
        this.$router.push('/aut'))
  }*/

  ClickHome() {
    this.$router.push('/help')
  }

}
</script>

<style scoped>
html,
body {
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
}



/* The switch - the box around the slider */
.switch {
  position: relative;
  display: inline-block;
  width: 40px;
  height: 30px;
}

/* Hide default HTML checkbox */
.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

/* The slider */
.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  -webkit-transition: 0.4s;
  transition: 0.4s;
}

.slider:before {
  position: absolute;
  content: "";
  height: 30px;
  width: 30px;
  left: 0px;
  bottom: 0px;
  right: 10px;
  top: 0;
  bottom: 0;
  margin: auto 0;
  -webkit-transition: 0.4s;
  transition: 0.4s;
  box-shadow: 0 0px 15px #2020203d;
  background: white url('../../assets/night.png');
  background-repeat: no-repeat;
  background-position: center;
}

input:checked + .slider {
  background-color: white;
}

input:focus + .slider {
  box-shadow: 0 0 1px #2196f3;
}

input:checked + .slider:before {
  -webkit-transform: translateX(24px);
  -ms-transform: translateX(24px);
  transform: translateX(24px);
  background: white url('../../assets/sunny.png');
  background-repeat: no-repeat;
  background-position: center;
}

/* Rounded sliders */
.slider.round {
  border-radius: 34px;
}

.slider.round:before {
  border-radius: 50%;
}

.borderTab{
  position: absolute;
  left: 0;
  height: 10px;
  width: 100%;
  top: 60px;
  background-image: linear-gradient(90deg, rgba(255,255,255,1) 0%, rgba(229,237,32,1) 27%, rgba(0,30,0,1) 100%);
  background-origin: border-box;
  background-clip: padding-box, border-box;
}



</style>