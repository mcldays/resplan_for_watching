<template>

<div>
  <v-tabs  v-model="tab" style="position: sticky; top: 0">
    <v-btn @click="goBack" icon><v-icon>mdi-arrow-left</v-icon></v-btn>
    <v-tab>
      Обычная Карточка
    </v-tab>
    <v-tab @click="opentTZ">Расширенная карточка</v-tab>
  </v-tabs>
<!--  <notification-hub text="test" :state="snackState" />-->
<!--  <span @mouseover="snackState = true" @mouseout="snackState=false">test</span>-->

  <v-tabs-items v-model="tab">
    <v-tab-item>
      <EditCard
          :headers="this.headers"
          :is-extended="true"
          :for-edit="true"
          :table-name-prop="tableName"
          :data="this.data"
          @back="goBack"
          @closed="refreshEdit"
          @needUpdateCard="refreshData"
      />
    </v-tab-item>
    <v-tab-item>
      <EditCard
          :is-report="true"
          :is-extended="true"
          :headers="requestParamHeaders"
          :table-name-prop="tableName"
          :for-edit="true"
          :data="requestParamData"
          @back="goBack"
          @closed="refreshEdit"
          @needUpdateCard="refreshDataParam"
          @updateReport = "updateReport"
      />
    </v-tab-item>
  </v-tabs-items>

</div>
</template>

<script lang="ts">
import {Component, Prop, Vue, Watch} from 'vue-property-decorator'
import {TableDataModel, Header} from "@/models/TableDataModel";
import EditCard from "@/ui/EditCard.vue";
import {mixins} from "vue-class-component";
import {tableMixin} from "@/mixins/tableMixin";
import EditCardExtended from "@/ui/EditCardExtended.vue";
import {baseController} from "@/controllers/baseController";
import moment from 'moment';
import NotificationHub from "@/views/NotificationHub.vue";
import {ordersController} from "@/controllers/ordersController";
@Component({
  components: {EditCardExtended, NotificationHub, EditCard}
})
export default class ExtendedCard extends mixins(tableMixin){
  // @Prop() headers : any[]
  // @Prop() data : any[]
  // @Prop() reportId : number
  // @Prop() rowClickId : number

  private headers : any[] = []
  private data : any[] = []
  private reportId : number
  private rowClickId : number

  private tab  = null
  private key = 0
  private requestParamData: any[] = []
  private requestParamHeaders: any[] = []
  private paramData: any[] = []
  private paramHeaders: Header[] = []
  private lastReportID:any = []
  private lastOrder : any = []
  private tableName  = ''
  private snackState = false
  private keyHack = 0

  async created(){
    let routeParams = this.$route.query
    let result = await  ordersController.GetAll()
    let stringOrder = this.preparedDataToTable(result)
    let prepared = stringOrder.valuesTable.filter(e=>e.fkey == routeParams.stringId)
    this.data = Object.values(prepared[0])
    this.headers = stringOrder.headersTable
    //console.log(stringOrder)
    this.reportId = Number(routeParams.reportId)
    this.rowClickId = Number(routeParams.stringId)
    this.keyHack++
    //await baseController.GetTable(String(routeParams.tableName), Number(routeParams.stringId)).then(this.test)
    await this.opentTZ()

  }


  // computedUrlProps(){
  //
  // }

  async opentTZ() {
    this.key++
    await this.refreshParams(this.reportId)
    if (this.paramData.length > 0) {
      this.requestParamHeaders = this.preparedParamHeaders(this.paramData)
       this.requestParamData = this.paramData.map( (el) => {
        if (el.fType === 'datetime')
        { 
          return el.fDefault === '' ? '' : moment(el.fDefault, 'YYYY-MM-DD').format('DD.MM.YYYY') 
        }
        else
        return el.fDefault}) 
    }
  }
  refreshEdit(){
     this.$router.push('/orderbook')
    this.$emit("closed")
  }

  refreshData(){
    this.$router.push('/orderbook')
    this.$emit("needUpdateCard")
  }
  refreshDataParam(item : any){
    this.$emit("needUpdateParam", item)
    //console.log(item)
  }

  async updateReport(fields : any[]){
     this.$router.back()
    this.$emit("closed")
    let resultParams : any = {}
    for(const fieldsDatum of fields){
      resultParams[fieldsDatum.key.value]  = fieldsDatum.value
      if(fieldsDatum.key.ref){
        resultParams[fieldsDatum.key.value] = Number(fieldsDatum.valueID)
      }
    }
    resultParams["f_spReports"] = this.reportId
        let result = await baseController.saveParamsValue(resultParams)
        this.refreshEdit()
    //console.log(resultParams,"params")
  }


  async refreshParams(reportID: number) {
    let result = await baseController.getReportParams(reportID, '{"f_boOrders":"' + this.rowClickId + '"}')

    let resultParsed = this.preparedDataToTable(result)
    this.paramData = resultParsed.valuesTable
    this.paramHeaders = resultParsed.headersTable
    this.tableName = this.paramHeaders[0].tblName as string
    this.lastReportID = reportID
  }

  goBack(){
    this.$router.push('/orderbook')
    this.$emit("back")
  }
}
</script>

<style scoped>

</style>