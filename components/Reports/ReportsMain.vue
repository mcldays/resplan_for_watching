<template>
  <div>
    <div style="display:flex;">
      <div style="width:20%;">
        <!-- Список типов отчетов-->
        <BaseTable
            table-name="Типы отчетов"
            :table-data="this.reportTypeList"
            :headers="this.reportTypeHeaders"
            @navigateDeep="rowClickedType"
            :selectedRowId="this.lastReportType===undefined?-1:this.lastReportType.fkey"
        />
      </div>
      <v-divider style="margin:10px;height:0px" vertical/>
      <div style="width:80%;">
        <!-- Список отчетов -->
        <BaseTable
            table-name="Отчеты"
            :table-data="this.reportList"
            :headers="this.reportHeaders"
            :toolbar-vision="this.isReadOnlyList"
            :control-button-vision="this.isReadOnlyList"
            @needUpdateTable="preparedDataForTable"
            @navigateDeep="rowClicked"
            @dbClick="dblClicked"
            :itemsPerPage = -1
            :customMenu="this.reportMenu"
            @editParams="editParams"
            :selectedRowId="this.lastReport===undefined?-1:this.lastReport.fkey"
            :defaultData="[{key: 'f_spReport_type', value: lastReportType.fkey}]"
        >
          <template v-slot:anyButtons>
            <TableButton
              :button="reportMenuOnTable"
              @editParams="editParams"
            />
          </template>
        </BaseTable>
      </div>
    </div>

    <!-- Превью отчета  -->
    <div v-if="previewState">
      <v-divider style="margin:10px;height:0px" vertical/>
      <BaseTable
        :table-data="this.previewData"
        :headers="this.previewHeaders"
        :toolbar-vision="false"
        table-name="Пример"
        :control-button-vision="false"
        :itemsPerPage = 15
      />
      <div v-if="previewState" style="display: flex; position: bottom: 0; z-index: 999" class="pa-5 lighten-4">
          <v-btn depressed color="primary" @click="loadReportFile">Выгрузить отчет</v-btn>
      </div>
    </div>

    <!-- Диалог с параметрами -->
     <v-dialog
        v-model="stateEditParams"
        v-if="stateEditParams"
        width="auto"
    >
      <BaseTable
        table-name="Параметры отчета"
        :headers="this.paramHeaders"
        :table-data="this.paramData"
        :control-button-vision="true"
        :toolbar-vision="true"
        @needUpdateTable="refreshParams"
        :defaultData="this.paramDefaultData"
      />
    </v-dialog>

    <!-- диалог для запроса параметров отчета -->
    <v-dialog
        persistent
        v-model="stateRequestParam"
        max-width="50%"
        v-if="stateRequestParam"
    >
      <EditCard
          :headers="this.requestParamHeaders"
          :for-edit="true"
          :returnBack="true"
          :data="this.requestParamData"
          @closed="closeRequestCard"
          @needUpdateCard="updateRequestCard"
      />
    </v-dialog>

  </div>
</template>

<script lang="ts">
import {Component} from 'vue-property-decorator'
import {mixins} from "vue-class-component";
import {tableMixin} from "@/mixins/tableMixin";
import {Header} from "@/models/TableDataModel";
import BaseTable from "@/ui/BaseTable.vue";
import {baseController} from "@/controllers/baseController";
import EditCard from "@/ui/EditCard.vue";
import {buttonModel} from "@/models/buttonModel";
import TableButton from "@/ui/TableButton.vue";

@Component({
  components: {BaseTable, EditCard, TableButton}
})
export default class ReportMain extends mixins(tableMixin) {  

  //report Types
  private reportTypeList: any[] = []
  private reportTypeHeaders: Header[] = []
  private lastReportType: any = []


  //report data
  private reportList: any[] = []
  private reportHeaders: Header[] = []
  private lastReport: any = []

  //preview
  private previewState = false
  private previewData: any[] = []
  private previewHeaders: Header[] = []

  //params
  private stateEditParams = false
  private paramData: any[] = []
  private paramHeaders: Header[] = []
  private paramDefaultData: any[] = []
  private stateRequestParam = false
  private lastRequestedParams: any
  private requestParamData: any[] = []
  private requestParamHeaders: any[] = []

  //rules
  private dots : any = {}
  private isReadOnlyList = true

  private reportMenu: any[] = [
    {title: 'Параметры отчета', event:'editParams'},
  ]

  private reportMenuOnTable : buttonModel[] = [
    {name: 'Параметры отчета', emit:'editParams'},
  ]

  async mounted(){
    await this.$store.dispatch('reRenderDots').then(()=>{
      this.getDots()
      this.preparedDataFortypes()
    }).catch((err)=>{
      console.log(err)
    })
  }

  getDots() {
    let dots = this.$store.getters.getControlDots as []
    //let result = dots.filter((t:any)=>t.href == this.$route.path)
    let result = dots.filter((t:any)=>this.$route.path.includes(t.href))
    this.dots = result[0]
    //console.log(this.dots)
  }

  async preparedDataFortypes() {
    let result = await baseController.GetTable('spReport_type')
    let reportListParsed = this.preparedDataToTable(result)
    
    //filter types
    const values = reportListParsed.valuesTable
    const vTypesKey = this.dots.child.map((el:any) => el.fName)
    this.reportTypeList = values.filter((el:any) => vTypesKey.includes(el.fName))

    this.reportTypeHeaders = reportListParsed.headersTable
    this.lastReportType = this.reportTypeList[0]
    this.rowClickedType(this.lastReportType)
    //await this.preparedDataForTable()
  }

  async preparedDataForTable() {
    let result = await baseController.getReports(this.lastReportType.fkey)
    let reportListParsed = this.preparedDataToTable(result)
    this.reportList = reportListParsed.valuesTable
    this.reportHeaders = reportListParsed.headersTable
    //this.rowClicked(this.lastReport)
  }

  async rowClickedType(item : any) {
    if (this.lastReportType !== item || this.lastReportType.length === 0) {
      if (this.lastReportType.length === 0) { this.lastReportType = this.reportTypeList[0] }
      else {this.lastReportType = item}
    }
    //Проверяем права на тип отчетов
    this.isReadOnlyList = this.dots.child.find((el:any) => el.fName == this.lastReportType.fName).fAccessType == 1 ? true : false
    await this.preparedDataForTable()
  }

  async rowClicked(item : any) {
    this.lastReport = item
  }

  async dblClicked(item: any) {
    console.log("async dblClicked(item: any)")
    this.requestParams()
  }

  async requestParams() {
    this.lastRequestedParams = null
    await this.refreshParams()
    if (this.paramData.length > 0) {
      this.stateRequestParam = true
      this.requestParamHeaders = this.preparedParamHeaders(this.paramData)
      this.requestParamData = this.paramData.map( (el) => el.fDefault)
    }
    else { this.refreshReport() }
  }

  async refreshReport() {
    let result = await baseController.execReport(this.lastReport.fkey, this.lastRequestedParams)
    let resultParsed = this.preparedDataToTable(result)
    this.previewData = resultParsed.valuesTable
    this.previewHeaders = resultParsed.headersTable
    this.previewState = true
  }

  async closeRequestCard() {
    this.stateRequestParam = !this.stateRequestParam
    this.previewState = false
  }

  async updateRequestCard(item: any) {
    this.closeRequestCard
    //анализируем что получили и пишем в this.lastRequestedParams
    if (item !== undefined) {
      this.lastRequestedParams = JSON.stringify(item)
    }
    this.refreshReport()
  }

  async refreshParams() {
    let result = await baseController.getReportParams(this.lastReport.fkey,'none')
    let resultParsed = this.preparedDataToTable(result)
    this.paramData = resultParsed.valuesTable
    this.paramHeaders = resultParsed.headersTable
  }

  async editParams() {
    this.stateEditParams = !this.stateEditParams
    if (this.stateEditParams) {
      this.paramDefaultData = [{key: 'f_spReports', value:  this.lastReport.fkey}]
      this.refreshParams()
    }
  }

  async loadReportFile() {
    //await baseController.execReportToFile(this.lastReport.fkey,this.lastRequestedParams)
    await baseController.execReportToFileXLSX(this.lastReport.fkey,this.lastRequestedParams)
  }

}
</script>

<style scoped>

</style>