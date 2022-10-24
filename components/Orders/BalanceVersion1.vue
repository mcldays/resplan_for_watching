<template>
  <div class="mainContain">

    <notification-hub
      :isChips="true"
      :text="notifyTextGen()"
      :state="selectedItem ? true : false"
      :timeout="-1"
      backgroundColor="white"
    />

    <div v-if="!infoDetailHeadState">
      <v-data-table
        :items="this.dataPlan"
        :headers="this.headersPlan"
        @dblclick:row="rowClickedPlan"
        :items-per-page="15"
        :loading="this.isLoading"
        class="elevation-5"
      >
      <template v-slot:body="{items}">
        <tbody>
        <tr
            v-for="(item,index) in items"
            :key="index"
        >
          <td v-for="(value,name,index1) in item"
            :key="index1"
            :class="curHideColumns.includes(name) === true ? 'text- d-none' : ''"
          >

            <!-- Поля месяцев -->
            <div v-if="monthColumns.includes(name)">
              <v-chip
                v-if="item[name] > 0"
                small
                dark
                :color="setChipColor(item, name, value)"
                @click="clickPlanChip(item, name.replace('mon',''))"
                @mouseover="selectChipItem(item, name.replace('mon',''))"
                @mouseout="unSelectChipItem()"
              > {{ value == '' ? '' : Math.round(value) }} </v-chip>
            </div>

            <!-- Все остальное -->
            <div v-else>
              {{ value }}
            </div>

          </td>
        </tr>
        </tbody>
      </template>
      </v-data-table>

      <!-- График загрузки -->
      <v-card class="my-2 elevation-5">
        <v-card-text>
          <div v-if="!isLoading">
            <lineTemplate class="my-2" :chartData="this.lineGrafficData" />
          </div>
        </v-card-text>
      </v-card>

    </div>

    <!--Дополниельная информация -->
    <div v-else>

      <!-- заголовок-->
      <div style="display:flex">
        <v-btn color="blue" text @click="btnBack"> 
          <v-icon style="size:8px" color="blue">mdi-arrow-left</v-icon>
          Назад
        </v-btn>
        <div v-for="(nLebel,index) in this.DetailHeadLebel.split('|')" :key="index" class="text-center">
          <v-chip outlined label class="mx-2"> {{nLebel.split(':')[0]}} <v-divider vertical  class="mx-2"/> <strong> {{nLebel.split(':')[1]}} </strong> </v-chip>
        </div>
      </div>

      <v-data-table
        :items="this.dataDetailHead"
        :headers="this.headersDetailHead"
        :items-per-page="15"
        :loading="this.isLoading"
        :item-class="DetailHeadRowClass"
        @click:row="DetailHeadClick"
        class="elevation-5"
      />
      
      <!-- тело детализации-->
      <v-data-table
        v-if="infoDetailBodyState"
        :items="this.dataDetailBody"
        :headers="this.headersDetailBody"
        :items-per-page="15"
        :loading="this.isLoadingBody"
        class="my-5 elevation-5"
      >
        <!--ИТОГО-->
        <template slot="body.append">
          <tr v-for="(item,index) in dataDetailBodySummary"
            :key="index"
          >
          <th v-for="(value,name,index1) in item"
            :key="index1"
            :class="monthColumnsHiLigth.includes(name) === true?' background-color: red lighten-5':''"
          >
            {{value}}
          </th>
          </tr>
        </template>
      </v-data-table>
      <div v-else>
        <v-alert
          v-if="nobodyDetail"
          class="ma-10" type="info" icon="mdi-cloud-alert" prominent
        >
          Нельзя посмотреть детализацию по загрузке профессий, если нет исполнителей на операции!
        </v-alert>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {Component, Prop, Watch} from "vue-property-decorator";
import {mixins} from "vue-class-component";
import {tableMixin} from "@/mixins/tableMixin";
import {ordersController} from "@/controllers/ordersController";
import {baseController} from "@/controllers/baseController";
import moment from 'moment';
import MessageBox from "@/ui/MessageBox.vue";
import NotificationHub from "@/views/NotificationHub.vue"
import eventBus from "@/eventBus";
import lineTemplate from "@/ui/diagrams/lineTemplate.vue";

@Component({
  components: {MessageBox, NotificationHub, lineTemplate}
})
export default class BalanceVersion1 extends mixins(tableMixin) {

  //Global varibles
  @Prop() selectedCompany:any

  private selectedPlan: any
  private selectedProblem: any = null
  private selectedProblemMonth = null
  private dataPlan: any[] = [{fname: "Загрузка..."}]
  private headersPlan: any[] = [{ text: 'Ждите', value: 'fname' }, ]
  private isLoading = true

  //Detail head
  private infoDetailHeadState = false
  private selecteDetaildHead: any = null
  private dataDetailHead: any[] = [{fname: "Загрузка..."}]
  private headersDetailHead: any[] = [{ text: 'Ждите', value: 'fname' }, ]
  private DetailHeadLebel = 'Загрузка...'
  private nobodyDetail = false

  //Detail body
  private infoDetailBodyState = false
  private dataDetailBody: any[] = [{fname: "Загрузка..."}]
  private headersDetailBody: any[] = [{ text: 'Ждите', value: 'fname' }, ]
  private dataDetailBodySummary: any[] = [{ text: 'Ждите', value: 'fname' }, ]
  private isLoadingBody = true

  private selectedItem: any = null
  
  private monthColumns = ["mon1","mon2","mon3","mon4","mon5","mon6","mon7","mon8","mon9","mon10","mon11","mon12"]
  private monthColumnsHiLigth: any[] = []
  private curHideColumns = ["fCritical","f_spProfession","f_spPodr_performer","fYear1","f_boOrders1","f_boOrders","f_spCompany_performer"
    ,"monExept1","monExept2","monExept3","monExept4","monExept5","monExept6","monExept7","monExept8","monExept9","monExept10","monExept11","monExept12"
    ,"monFondProc1", "monFondProc2", "monFondProc3","monFondProc4", "monFondProc5", "monFondProc6","monFondProc7", "monFondProc8", "monFondProc9","monFondProc10", "monFondProc11", "monFondProc12"
  ]
  private detailBodyHide = ["fOrder","monExept1","monExept2","monExept3","monExept4","monExept5","monExept6","monExept7","monExept8","monExept9","monExept10","monExept11","monExept12"]

  //График
  private lineGrafficData:any = {
    labels: ['January', 'February',],
    datasets: [ { label: 'Data One', backgroundColor: '#f87979', data: [40, 39] } ]
  }
  private gradient: null
  private gradient2: null

  async created() {
    this.preparedDataPlan()
  }

  @Watch("selectedCompany", {deep: true})
  async preparedDataPlan() {
    this.isLoading = true
    await this.preparedDataGraffic()
    const result = await baseController.execReport(26, '{"f_spCompany":"' + this.selectedCompany + '"}')
    let dataTableParsed = this.preparedDataToTable(result)
    this.dataPlan = dataTableParsed.valuesTable
    this.headersPlan = dataTableParsed.headersTable
    this.hideColumns(this.headersPlan, this.curHideColumns)
    this.isLoading = false
  }

  async preparedDataDetailHead() {
    this.isLoading = true
    const result = await baseController.execReport(27,
      '{"f_spCompany":"' + this.selectedCompany
        + '","f_boOrders":"' + this.selectedProblem.f_boOrders
        + '","year":"' + this.selectedProblem.fYear
        + '","int_mon":"' + this.selectedProblemMonth + '"}')
    let dataTableParsed = this.preparedDataToTable(result)
    this.dataDetailHead = dataTableParsed.valuesTable
    this.headersDetailHead = dataTableParsed.headersTable
    this.hideColumns(this.headersDetailHead, this.curHideColumns)
    this.isLoading = false
    //console.log('this.dataDetailHead', this.dataDetailHead)
  }

  async preparedDataDetailBody() {
    this.isLoadingBody = true
    const result = await baseController.execReport(28, 
      '{"f_spCompany":"' + this.selectedCompany 
        + '","year":"' + this.selectedProblem.fYear
        + '","f_spPodr":"' + this.selecteDetaildHead.f_spPodr_performer
        + '","f_spProfession":"' + this.selecteDetaildHead.f_spProfession + '"}')
    let dataTableParsed = this.preparedDataToTable(result)
    //Отделяем итоговые строки
    this.dataDetailBodySummary = dataTableParsed.valuesTable.slice(dataTableParsed.valuesTable.length-2,dataTableParsed.valuesTable.length)
    this.dataDetailBodySummary.forEach((el:any) => { delete el.fOrder })
    //Месяца которые нужно подсветить в детализациии
    this.monthColumnsHiLigth = this.monthColumns.filter( (el:any) => parseFloat(this.dataDetailBodySummary[0][el]) >= parseFloat(this.dataDetailBodySummary[1][el]) )
    this.headersDetailBody = dataTableParsed.headersTable
    this.hideColumns(this.headersDetailBody, this.detailBodyHide)
    //подкрашиваем ячейки
    dataTableParsed.headersTable.forEach((el:any) => {
      if (this.monthColumnsHiLigth.includes(el.value)) {
        el.Class = 'background-color: red lighten-5'
        el.cellClass = 'background-color: red lighten-5'
      }
    })
    this.dataDetailBody = dataTableParsed.valuesTable.slice(0,dataTableParsed.valuesTable.length-2)
    this.isLoadingBody = false
  }

  async preparedDataGraffic () {
    const result = await baseController.execReport(30, '{"f_spCompany":"' + this.selectedCompany + '"}')
    let dataTableParsed = this.preparedDataToTable(result)
    let headers:any = dataTableParsed.headersTable.map((el:any) => el.text)
    headers = headers.slice(1,headers.length)
    let data = dataTableParsed.valuesTable
    data.forEach((el:any) => el.Color = '#'+(0x1000000+Math.random()*0xffffff).toString(16).substr(1,6))
    data = dataTableParsed.valuesTable.map((el:any) => ({
        label: el.fYear,
        backgroundColor: el.Color,
        borderColor: el.Color,
        pointBackgroundColor: "white",
        //pointBorderColor: "white",
        borderWidth: 3,
        data: Object.values(el).filter((value:any,index) => index !== 0 ).map((ptl:any) => ptl==='' ? 0 : parseInt(ptl))
    }))
    this.lineGrafficData = { labels: headers, datasets: data }
  }

  notifyTextGen() {
    if (this.selectedItem !== null) {
      //console.log("f_boOrders",this.selectedItem.f_boOrders)
      const expt = this.selectedItem['monExept' + this.selectedProblemMonth]
      const cross = Math.trunc(expt)
      const noStaff = Math.trunc((expt - cross) * 100)
      const noSelectedStaff = Math.trunc((expt - cross - noStaff/100) * 10000)
      const monFondProc = parseFloat(this.selectedItem['monFondProc'+this.selectedProblemMonth])
      const colorProc = this.calcColor(monFondProc)
      const outText = [
        { name: "Информация по заказу: ", color: "grey" },
        { name: "№: ", value: this.selectedItem.fNumReg , color: "grey" },
        { name: "Труд: ", value: this.selectedItem['mon' + this.selectedProblemMonth] , color: "grey" },
        { name: "Максимальная перегрузка фонда: ", value: Math.trunc(monFondProc*100) + '%', color: 'grey' },
      ]
      if (cross > 0) { outText.push( { name: "Перегрузки рабочего фонда: ", value: cross , color: "grey" } )}
      if (noStaff > 0) { outText.push( { name: "Нет в штате: " , value: noStaff , color: "grey" } )}
      if (noSelectedStaff > 0) { outText.push( { name: "Исполнители не выбраны:" , value: noSelectedStaff, color: "grey" } )}
      return outText
    }
    return null
  }

  setChipColor(item:any, name: any, value:any) {
    const monExept = Math.round( parseFloat( item['monExept'+ name.replace('mon','')]) * 100) /100
    if (monExept > 0) {
      const monFondProc = parseFloat(item['monFondProc'+ name.replace('mon','')])
      if (monExept < 1) { return '#0fdbd1'}
      else {
        if (monFondProc > 1) {
          return this.calcColor(monFondProc)
        }
      }
    } else {
      if (item['monFondProc'+ name.replace('mon','')] == '') {
        return '#48484a'
      }
    }
    return 'grey'
  }

  calcColor(monFondProc: any) {
    const colorP = Math.trunc(300 * (1-(monFondProc-1)) - 100 ).toString()
    return 'rgba(255,' + colorP +', 0, ' + 0.8 / monFondProc +')'
  }

  selectChipItem (item:any, index: any) {
    this.selectedProblemMonth = index
    this.selectedItem = item
  }
  
  unSelectChipItem () {
     this.selectedItem = null
  }

  clickPlanChip(item:any, index: any) {
    //console.log("item",item)
    this.dataDetailHead = [{fname: "Загрузка..."}]
    this.headersDetailHead = [{ text: 'Ждите', value: 'fname' }, ]
    this.selectedProblemMonth = index
    this.infoDetailHeadState = true
    this.selectedProblem = item
    this.selectedItem = null
    //Формируем заголовок
    const mHeader = this.headersPlan.find((el)=>el.value == 'mon' + index)
    this.DetailHeadLebel = "Год: " + item.fYear + "|Месяц: " + mHeader.text + "|Заказ:" + item.fNumReg
    //Делаем запрос
    this.preparedDataDetailHead()
  }

  DetailHeadRowClass(item: any) {
    let newClass = item.fCritical === '1' ? "background-color: red lighten-5" : null
    return newClass
  }

  btnBack() {
    this.infoDetailHeadState = false
    this.infoDetailBodyState = false
    this.nobodyDetail = false
  }

  rowClickedPlan() {
    console.log("rowClickedPlan");
  }

  DetailHeadClick(item:any) {
    this.selecteDetaildHead = item
    if (this.selecteDetaildHead.f_spProfession > 0) {
      this.preparedDataDetailBody()
      this.infoDetailBodyState = true
      this.nobodyDetail = false
    } else {
      this.nobodyDetail = true
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