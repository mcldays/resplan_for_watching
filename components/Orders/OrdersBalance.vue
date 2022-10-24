<template>
  <div class="mainContain">

   <div v-if="selectedCompany === 0">
      <v-alert class="ma-10" type="info" icon="mdi-cloud-alert" prominent>
        В фильтре <strong>Компаний</strong> у вас выбран пункт <strong>Все</strong>
        , для раздела <strong>Балансировка</strong> необходимо выбрать компанию
        , это можно в верхнем правом углу экрана.
      </v-alert>
    </div>
    
    <v-card>
      <v-tabs center-active dark>
        <v-tab v-for="(tab,key) in this.tabNames" :key="key" @click="openTab(tab)"> 
          <v-icon class="mx-2">{{tab.icon}}</v-icon>
          {{tab.fDesc}} 
        </v-tab>
      </v-tabs>
    </v-card>


    <!-- 0 По отделам -->
    <div v-if="curentTab===0">
      <BalanceVersion2
        :selectedCompany="this.selectedCompany"
      />
    </div>

    <!-- 1 По заказам -->
    <div v-if="curentTab===1">
      <BalanceVersion1
        :selectedCompany="this.selectedCompany"
      />
    </div>

    <!-- 2 Гант -->
    <div v-if="curentTab===2">
      <GantDiagram
        :data-gant="this.stepDataGant"
        :steps = true
        style="overflow: hidden"
        :gantt-type="false"
        titleStr="Весь портфель"
        :showOpers="false"
        :showStep="false"
        :heightMunus="90"
      />
    </div>


  </div>
</template>

<script lang="ts">
import {Component} from "vue-property-decorator";
import {mixins} from "vue-class-component";
import {tableMixin} from "@/mixins/tableMixin";
import MessageBox from "@/ui/MessageBox.vue";
import NotificationHub from "@/views/NotificationHub.vue"
import eventBus from "@/eventBus";
import lineTemplate from "@/ui/diagrams/lineTemplate.vue";
import BalanceVersion1 from "@/components/Orders/BalanceVersion1.vue";
import BalanceVersion2 from "@/components/Orders/BalanceVersion2.vue";
import GantDiagram from '@/ui/GantDiagram.vue'
import {baseController} from "@/controllers/baseController";

@Component({
  components: {MessageBox, NotificationHub, lineTemplate, BalanceVersion1, BalanceVersion2, GantDiagram}
})
export default class OrdersBalance extends mixins(tableMixin) {

  //Global varibles
  public selectedCompany:any = 0

  private curentTab = 0
  
  private gantLoaded = false
  private stepDataGant :any[] = []

  //menu variant slices
  private tabNames : any[] = [
    {ID: 0, fDesc: "По отделам", icon: "mdi-account-group-outline"},
    {ID: 1, fDesc: "По заказам", icon: "mdi-briefcase-outline"},
    {ID: 2, fDesc: "Гант", icon: "mdi-chart-gantt"},
  ]
 
  async created() {
    //получаем фильтр по Предприятию и подписываемся на событие
    this.loadSelectedCompany()
    window.addEventListener('storage', this.loadSelectedCompany)
  }

  async loadSelectedCompany() {
    const selectedCompanyID_str = window.localStorage.getItem("selectedCompanyID")
    this.selectedCompany = parseInt(selectedCompanyID_str===null?"-1":selectedCompanyID_str)
  }

  async openTab(tab: any) {
    if (tab.ID == 2) { await this.openGantStep() }
    this.curentTab = tab.ID
  }

   async openGantStep() {
    if (!this.gantLoaded) {
      let result = await baseController.getReportGraf(0, this.selectedCompany)
      let resultParsed = this.preparedDataToTable(result)
      this.stepDataGant = resultParsed.valuesTable
      this.gantLoaded = true
    }
  }

}

</script>

<style scoped>

.theme--light.v-data-table tbody tr:nth-of-type(even) {
    background-color: rgba(0, 0, 0, .03);
}

.theme--dark.v-data-table tbody tr:nth-of-type(even) {
    background-color: rgba(0, 0, 0, .5);
}

</style>