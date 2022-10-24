<template>

  <div>
    <div class="mainContain">
<!--      <MessageBox title="test" message="test" :v-model="true" @result="resultModal"/>-->
      <MessageBox
          v-if="lastOrder"
          :v-model="orderCopyState"
          :title="'Сделать копию Заказа №' + lastOrder.fNumReg + ' ?'"
          message="Заказ будет скопирован с полным цитированием всех реквизитов, и состава!"
          @result="copyOrderForce"
      />
    <div v-if="!PTNSelectState">
      <BaseTable
          :is-extended="true"
          :report-id="11"
          :table-data="this.dataTable"
          :headers="this.headers"
          :table-name="tableName"
          :toolbar-vision="!readOnlyModule"
          :control-button-vision="true"
          @navigateDeep="rowClicked"
          :itemsPerPage = 5
          @needUpdateTable="refreshData(1, ...arguments)"
          :customMenu="this.orderMenu"
          @newOrderFromContract="newOrderFromContract()"
          @openCardCriteria="openCardCriteria"
          @openSpendMatType="openSpendMatType"
          @opentTZ="opentTZ(11)"
          @opentTZ_load="opentTZ_load(11)"
          @openResPlan_load="openResPlan_load"
          @open_PTNSelect="open_PTNSelect"
          @PTNPatentCard="PTNPatentCard"
          :selectedRowId="this.lastOrder===undefined?-1:this.lastOrder.fkey"
          :defaultData="defaultDataOrder"
          :canCopyRows="true"
      >
        <template v-slot:anyButtons>
          <TableButton
           :button="orderMenuOnTable"
           @newOrderFromContract="newOrderFromContract()"
           @openCardCriteria="openCardCriteria"
           @openSpendMatType="openSpendMatType"
           @dbClick="openCardCriteria"
          />
          <ButtonGroup
            v-if="!readOnlyModule"
            group-name="Создать из экземпляра"
            :buttons="newOrderButtons"
            @newOrderFromContract="newOrderFromContract()"
            @newOrderFromOrder="newOrderFromOrder()"
          />
          <ButtonGroup
            group-name="Выгрузить Отчеты"
            :buttons="reportsButtons"
            @opentTZ="opentTZ(11)"
            @opentTZ_load="opentTZ_load(11)"
            @openResPlan_load="openResPlan_load"
          />
          <ButtonGroup
            group-name="Диаграммы"
            :buttons="diagramMenu"
            @openGant="openGant"
            @openGantStep="openGantStep(true)"
            @openGantStepCanvas="openGantStep(false)"
            @openGantStepCanvasAll="openGantStep(false, true)"
          />
        </template>
      </BaseTable>
    
    <v-divider style="margin:10px;height:0px;"/>
    <div>
      <v-fade-transition>
      <div v-if="stepTableState" >
        <div >
          <BaseTable
            :table-name="this.tableNameStep"
            :table-data="this.stepDataTable"
            :headers="this.stepHeaders"
            :control-button-vision="true"
            :toolbar-vision="!readOnlyModule"
            :customMenu="this.stepMenu"
            @navigateDeep="rowClickedStep"
            @needUpdateTable="refreshData(2)"
            @orderStepSpendCard="orderStepSpendCard"
            :defaultData="this.stepDefaultData"
            :selectedRowId="this.lastStep===undefined?-1:this.lastStep.fkey"
            :canCopyRows="true"
          >
            <template v-slot:anyButtons>
                <TableButton
                  v-if="!readOnlyModule"
                  :button="stepButtons"
                  @orderStepSpendCard="orderStepSpendCard"
                />
            </template>
          </BaseTable>
        </div>
        <v-divider style="margin:10px;height:0px"/>
        <div  v-if="orderSpecState">
          <BaseTable
              :table-name="this.tableNameSpec"
              :table-data="this.specDataTable"
              :headers="this.specHeaders"
              :toolbar-vision="!readOnlyModule"
              :control-button-vision="true"
              @navigateDeep="rowClickedSpec"
              @needUpdateTable="refreshData(3)"
              @orderSpecCard="orderSpecCard"
              @calcOrderGrafic="calcOrderGrafic"
              @performersCard_new="performersCard_new"
              :defaultData="this.specDefaultData"
              :customMenu="this.specMenu"
              :canCopyRows="true"
              :selectedRowId="this.lastSpec===undefined?-1:this.lastSpec.fkey"
          >
            <template v-slot:anyButtons>
                <TableButton
                  v-if="!readOnlyModule"
                  :button="specChangeButton"
                  @orderSpecCard="orderSpecCard"
                  @performersCard_new="performersCard_new"
                />
                <ButtonGroup
                  v-if="!readOnlyModule"
                  group-name="Подбор трудоемкости"
                  :buttons="PTNButtons"
                  @open_PTNSelect="open_PTNSelect"
                  @PTNPatentCard="PTNPatentCard"
                />
            </template>
          </BaseTable>
          <v-dialog
          v-model="diagramState"
          fullscreen
         >
          <GantDiagram
              v-if="diagramState"
              :data-gant="this.specDataTable"
              @closedGant = "closeGant"
              style="overflow: hidden"
              :steps = false
              :gantt-type=true
              :titleStr="'Заказ: ' + lastOrder.fNumReg + ' ' + lastOrder.fDescription"
          />
          </v-dialog>
        </div>
        <v-dialog
            v-model="diagramStateStep"
            fullscreen
        >
          <GantDiagram
              v-if="diagramStateStep"
              :data-gant="this.stepDataGant"
              :steps = true
              @closedGant = "closeGant"
              style="overflow: hidden"
              :gantt-type="gantt_Type"
              :titleStr="gantt_allOrders ? 'Весь портфель' : 'Заказ: ' + lastOrder.fNumReg + ' ' + lastOrder.fDescription"
              :showOpers="!gantt_allOrders"
              :showStep="!gantt_allOrders"
          />
        </v-dialog>
      </div>
      </v-fade-transition>
    </div>
    </div>
    <v-dialog
        persistent
        v-model="orderSpecCardState"
        width="auto"
        v-if="orderSpecCardState"
    >
      <TreeView
        bdName ="spWorks"
        myTitle="Работы"
        :disable-moving="false"
        :expand-all="false"
        :dynamic-loading="true"
        tree-height="max-content"
        :iconPack="1"
        :isselectable="true"
        @closed="orderSpecCard"
        @chosenRow="addDataFromDialogTree"
        :selectedKeys="this.selectedKeys"
      />
    </v-dialog>

    <v-dialog
          v-model="selectContractDialogState"
          width="auto"
          v-if="selectContractDialogState"
      >
        <select-table
            :headers="this.headersForDialog"
            :table-data="this.dataForDialog"
            @chosenRow="addDataFromDialog"
        ></select-table>
      </v-dialog>

    <v-dialog
        persistent
        v-model="cardStateEdit"
        max-width="50%"
        v-if="cardStateEdit"
      >
      <EditCard
          :headers="JSON.parse(JSON.stringify(this.headers))"
          :for-edit="false"
          :data="undefined"
          @closed="refreshCard"
          @needUpdateCard="refreshData(1)"
          :defaultRow="this.cardDefaultData"
      />
    </v-dialog>

    <v-dialog
        v-model="openCardCriteriaCard"
        width="auto"
        v-if="openCardCriteriaCard"
    >
      <TreeView
        bdName ="spCriteria"
        myTitle="Критерии"
        :expand-all="false"
        :dynamic-loading="true"
        tree-height="max-content"
        :iconPack ="1"
        :isselectable="true"
        @closed="openCardCriteria"
        @chosenRow="updateCardCriteria"
        :selectedKeys="this.selectedKeysCriteria"
      />
    </v-dialog>

  <!-- Расходы по типу на этап -->
    <v-dialog
        v-model="orderStepSpendState"
        v-if="orderStepSpendState"
    >
      <SpendsCard
        :stepKey="this.lastStep.fkey"
        @closed="orderStepSpendCard"
        @needUpdateTable="refreshData(1)"
      />
    </v-dialog>

  <!-- Расходы по типу на заказ -->
    <v-dialog
        v-model="openSpendMatTypeCard"
        width="auto"
    >
      <BaseTable
        table-name="Расходы по типу"
        :headers="this.headersForDialog"
        :table-data="this.dataForDialog"
        :control-button-vision="true"
        :toolbar-vision="true"
        :defaultData="this.stepDefaultData"
        @needUpdateTable="refreshData(4)"
        :canCopyRows="true"
      />
    </v-dialog>

    <!-- диалог для запроса параметров отчета -->
    <v-dialog
        persistent
        v-model="stateRequestParam"
        max-width="80%"
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

    <v-dialog
      persistent
      v-model="PTNSelectState"
      v-if="PTNSelectState"
      hide-overlay
      transition="dialog-bottom-transition"
      fullscreen
    >
      <PTNSelect
        :orderKey="this.lastOrder.fkey"
        @closed="open_PTNSelect"
      />
    </v-dialog>

    <v-dialog
      persistent
      v-model="PTNPatentState"
      v-if="PTNPatentState"
      transition="dialog-bottom-transition"
      width="60%"
    >
      <PTNPatent
        :orderKey="this.lastOrder.fkey"
        @closed="PTNPatentCard"
        @needUpdateTable="refreshData(1)"
      />
    </v-dialog>

    <!-- Список исполнителей операции -->
    <v-dialog
        v-model="performersState_new"
        v-if="performersState_new"
        width="40%"
    >
      <PerformersCard 
        :specKey="this.lastSpec.fkey"
        @closed="performersCard_new"
        @needUpdateTable="refreshData(3)"
      />
    </v-dialog>

  </div>
  </div>
</template>

<script lang="ts">
import {Component} from "vue-property-decorator";
import BaseTable from "@/ui/BaseTable.vue";
import {mixins} from "vue-class-component";
import {tableMixin} from "@/mixins/tableMixin";
import {ordersController} from "@/controllers/ordersController";
import {baseController} from "@/controllers/baseController";
import {Header} from "@/models/TableDataModel";
import TreeView from "@/ui/TreeView.vue";
import SelectTable from "@/ui/SelectTable.vue";
import EditCard from "@/ui/EditCard.vue";
import moment from 'moment';
import GantDiagram from '@/ui/GantDiagram.vue'
import Preloader from '@/ui/Preloader.vue'
import MessageBox from "@/ui/MessageBox.vue";
import ButtonGroup from "@/ui/ButtonGroup.vue";
import {buttonModel} from "@/models/buttonModel";
import TableButton from "@/ui/TableButton.vue";
import NotificationHub from "@/views/NotificationHub.vue"
import PTNSelect from "@/components/Orders/PTNSelect.vue";
import PerformersCard from "@/components/Orders/PerformersCard.vue";
import PTNPatent from "@/components/Orders/PTNPatent.vue";
import eventBus from "@/eventBus";
import SpendsCard from "@/components/Orders/SpendsCard.vue";
import ExtendedCard from "@/ui/ExtendedCard.vue";

@Component({
  components: {TableButton, ButtonGroup, MessageBox, BaseTable, TreeView, SelectTable, EditCard, GantDiagram
    , NotificationHub, PTNSelect, PerformersCard, PTNPatent, SpendsCard, ExtendedCard}
})
export default class OrdersMain extends mixins(tableMixin) {

  //Global varibles
  public selectedCompany:any = 0
  private orderCopyState = false
  private dots : any = {}
  private readOnlyModule = true

  //Order Data
  private dataTable: any[] = []
  private headers: Header[] = []
  private tableName = "Портфель заказов КНИПИ"
  private lastOrder : any = []
  private defaultDataOrder = [ { key: 'f_spDocStatus', value: 1 }, { key: 'f_spCompany_performer', value: 0 } ]

  //Criteria data
  private openCardCriteriaCard = false
  private selectedKeysCriteria : any[] = []
  private selectedCriteria : any[] = []

  //Step Data
  private stepTableState  = false
  private stepDataTable : any[] = []
  private stepHeaders : Header[] = []
  private stepDefaultData : any[] = []
  private tableNameStep : any = ""
  private lastStep : any = []

  //Spec Data
  private specTableState  = false
  private specDataTable : any[] = []
  private specHeaders : Header[] = []
  private specDefaultData : any[] = []
  private tableNameSpec : any = ""
  private orderSpecCardState = false
  private selectedKeys : any[] = []
  private orderSpecState = true
  private diagramState = false
  private lastSpec : any = []

  //Contract select Data
  private selectContractDialogState = false
  private dataForDialog: any[] = []
  private headersForDialog: any[] = []
  private lastReportID:any = []

  //Cart Data
  private cardStateEdit = false
  private cardDefaultData : any[] = []

  //Report params
  private stateEditParams = false
  private paramData: any[] = []
  private paramHeaders: Header[] = []
  private stateRequestParam = false
  private lastRequestedParams: any
  private requestParamData: any[] = []
  private requestParamHeaders: any[] = []

  private openSpendMatTypeCard = false
  private diagramStateStep  = false
  private stepDataGant :any[] = []
  private gantt_allOrders = false
  private gantt_Type = false
  private PTNSelectState = false
  private PTNPatentState = false

  //Performers param
  private performersState_new = false

  //Order Step Spend param
  private orderStepSpendState = false

  private orderMenu: any[] = [
    //{title: 'Создать заказ из договора', event:'newOrderFromContract'},
    {title: 'Критерии заказа', event: 'openCardCriteria', icon: 'mdi-format-list-checks'},
    //{title: 'Подбор трудоемкости', event:'open_PTNSelect'},
    //{title: 'Расходы по типу', event:'openSpendMatType'},
    {title: 'Доп. Параметры', event:'opentTZ', icon: 'mdi-format-list-group'},
    //{title: 'Отчет ТЗ выгрузить', event:'opentTZ_load'},
    //{title: 'Ресурсный план выгрузить', event:'openResPlan_load'},
    //{title: "Патентный поиск", event: "PTNPatentCard"},
  ]

  private orderMenuOnTable : buttonModel[] = [
    //{name: 'Создать заказ из договора', emit:'newOrderFromContract'},
    //{name: 'Критерии заказа', emit:'openCardCriteria'},
    //{name: 'Расходы по типу', emit:'openSpendMatType'},
  ]

  private newOrderButtons : buttonModel[] = [
    {name: 'Выбрать Договор', emit:'newOrderFromContract'},
    {name: 'Копия выбранного Заказа', emit:'newOrderFromOrder'},
  ]

  private reportsButtons : buttonModel[] = [
    {name: 'Отчет ТЗ выгрузить', emit:'opentTZ_load'},
    {name: 'Ресурсный план выгрузить', emit:'openResPlan_load'},
  ]

  private PTNButtons : buttonModel[] = [
    {name: 'Подбор трудоемкости по аналогу', emit:'open_PTNSelect'},
    {name: 'Литературно-патентный анализ', emit:'PTNPatentCard'},
  ]

  private stepMenu: any[] = [
    {title: 'Дополнительные расходы', event:'orderStepSpendCard', icon: 'mdi-cash-multiple'},
  ]

  private stepButtons : buttonModel[] = [
    {name: 'Дополнительные расходы', emit: 'orderStepSpendCard'},
  ]

  private specMenu: any[] = [
    {title: 'Изменить спецификацию', event:'orderSpecCard', icon: 'mdi-order-bool-descending-variant'},
    {title: 'Пересчитать график', event:'calcOrderGrafic', icon: 'mdi-calculator'},
    {title: 'Исполнители', event : 'performersCard_new', icon: 'mdi-account-plus'},
    //{title: 'Диаграмма Гантта', event: 'openGant'},
    //{title: 'Диаграмма Гантта по этапам', event: "openGantStep"},
  ]

  private diagramMenu : buttonModel[] = [
    //{name: "Диаграмма Ганта", emit: "openGant"},
    //{name: 'Диаграмма Ганта по этапам', emit: "openGantStep"},
    { name: 'Диаграмма Ганта на заказ', emit: "openGantStepCanvas" },
    { name: 'Диаграмма Ганта на весь портфель', emit: "openGantStepCanvasAll" },
  ]

  private specChangeButton : buttonModel[] = [
    {name: "Изменить спецификацию", emit: "orderSpecCard"},
    {name: "Исполнители", emit: "performersCard_new"},
  ]

  get dotAccess(){
    if(Object.getOwnPropertyDescriptor(this.dots, 'child')){
      let result = this.dots.child.filter((e:any)=>e.fkey == 13)
      if(result !=undefined){
        return true
      }
      else return false
    }
    else return false
  }

  async mounted(){
    await this.$store.dispatch('reRenderDots').then(()=>{
      this.getDots()
    }).catch((err)=>{
      console.log(err)
    })
  }

  async created() {
    //получаем фильтр по Предприятию и подписываемся на событие
    this.loadSelectedCompany()
    window.addEventListener('storage', this.loadSelectedCompany)
  }

  async loadSelectedCompany() {
    const selectedCompanyID_str = window.localStorage.getItem("selectedCompanyID")
    this.selectedCompany = parseInt(selectedCompanyID_str===null?"-1":selectedCompanyID_str)
    this.defaultDataOrder.forEach((el)=>{if(el.key === 'f_spCompany_performer') {el.value = this.selectedCompany} })
    this.lastOrder = ''
    console.log("this.lastOrder",this.lastOrder.fkey)
    await this.preparedDataForTable()
  }

  async preparedDataForTable() {
    let result = await ordersController.getOrders_filtered(this.selectedCompany,"0")
    let dataTableParsed = this.preparedDataToTable(result)
    this.dataTable = dataTableParsed.valuesTable
    this.headers = dataTableParsed.headersTable
    this.rowClicked(this.lastOrder)
  }

  async rowClicked(item : any) {
    //this.rowDataItem = item
    if (this.lastOrder !== item || this.lastOrder == '') {
      if (this.lastOrder == '') {
        this.lastOrder = this.dataTable[0]
       }
      else {
        this.lastOrder = item
      }
      if (this.lastOrder !== undefined) {
        let result = await ordersController.GetOrdersStep(0,this.lastOrder.fkey)
        let parsed = this.preparedDataToTable(result)
        this.stepDataTable = parsed.valuesTable
        this.stepHeaders = parsed.headersTable
        this.stepTableState = true
        this.tableNameStep = String(parsed.headersTable[0].tblNameCirilic)
        this.recalcLastNumberStep()
        //select first step
        this.rowClickedStep(this.stepDataTable[0])
      }
    }
    else { if (this.dataTable.length>0) {this.stepTableState = true} else {this.stepTableState = false}}
  }

  recalcLastNumberStep() {
    let lastNum = Math.max(...this.stepDataTable.map(o => parseInt(o.fNumber))) + 1
    if (lastNum < 1) lastNum = 1
    this.stepDefaultData = [
      { key: 'f_boOrders', value:  this.lastOrder.fkey },
      { key: 'fNumber', value: lastNum},
    ]
  }

  async rowClickedStep(item : any) {
    if (item === undefined)
      this.orderSpecState = false
    else
    if (this.lastStep !== item) {
      this.orderSpecState = true
      this.lastStep = item
      let result = await ordersController.GetOrdersSpec(0,item.fkey)
      let parsed = this.preparedDataToTable(result)
      this.specDataTable = parsed.valuesTable
      this.specHeaders = parsed.headersTable
      this.specTableState = true
      this.tableNameSpec = String(parsed.headersTable[0].tblNameCirilic)
      this.recalcLastNumberSpec()
      //select first spec
      this.rowClickedSpec(this.specDataTable[0])
    }
  }

  recalcLastNumberSpec() {
    let lastNum = Math.max(...this.specDataTable.map(o => parseInt(o.fNumber))) + 1
      if (lastNum < 1 ) lastNum = 1
      this.specDefaultData = [
        { key: 'f_boOrder_Step', value: this.lastStep.fkey },
        { key: 'fNumber', value: lastNum },
      ]
  }

  rowClickedSpec(item: any) {
    this.lastSpec = item
  }

  async refreshData(TableType: any, filters: any = undefined, item: any = undefined) {
    //console.log("TableType", TableType)
    //console.log("filters", filters)
    //console.log("item", item)
    //Находим нужно ли сделать фокусировку
    var id: any = undefined
    if (item) {
      id = parseInt(item.data)
    }

    //обновляем данные в списке
    if (TableType === 1) {
      //let result = await ordersController.GetAll()
      if (filters==undefined || filters=="") { filters = "0" }
      let result = await ordersController.getOrders_filtered(this.selectedCompany,filters)
      this.dataTable = this.preparedDataToTable(result).valuesTable
      if (id) {
        const newItem = this.dataTable.find((el) => el.fkey == id)
        if (newItem) {
          this.lastOrder = newItem
          this.rowClicked(this.lastOrder)
        }
      }
      if (this.dataTable.length == 0) {
        this.lastOrder = []
        this.stepTableState = false
      } else { this.stepTableState = true }
      this.refreshData(2)
    } else if (TableType === 2) {
      console.log("this.lastOrder",this.lastOrder)
      if (this.lastOrder.length > 0) {
        let result = await ordersController.GetOrdersStep(0,this.lastOrder.fkey)
        this.stepDataTable = this.preparedDataToTable(result).valuesTable
        this.recalcLastNumberStep()
      } else { this.stepDataTable = [] }
      this.refreshData(3)
    } else if (TableType === 3) {
      if (this.lastStep.length > 0) {
        let result = await ordersController.GetOrdersSpec(0,this.lastStep.fkey)
        this.specDataTable = this.preparedDataToTable(result).valuesTable
        this.recalcLastNumberSpec()
      } else { this.specDataTable = [] }
    } else if (TableType === 4) {
      let result = await baseController.getSpendMatType(0, this.lastOrder.fkey)
      this.dataForDialog = this.preparedDataToTable(result).valuesTable
    }
  }

  async newOrderFromContract()
  {
    //console.log("newOrderFromContract")
    this.selectContractDialogState = true
    let result = await baseController.getRelValue('boContracts', 0)
    let parsed = this.preparedDataToTable(result)
    this.dataForDialog = parsed.valuesTable
    this.headersForDialog = parsed.headersTable
  }

  addDataFromDialog(item: any) {
    //console.log("addDataFromDialog",item)
    this.cardDefaultData = [
      {key: 'f_boContracts', value: item.fkey},
      {key: 'f_spCompany_performer', value: item.f_spCompany_performer},
      {key: 'f_spCompany_client', value: item.f_spCompany_client},
      {key: 'fDateReg', value: moment(item.fDateReg, 'DD.MM.YYYY').format('YYYY-MM-DD')},
      {key: 'fDateFinish', value: moment(new Date((new Date()).getFullYear(), 11, 31), 'DD.MM.YYYY').format('YYYY-MM-DD')},
      {key: 'fNumReg', value: item.fNumReg_external + '-1'},
      {key: 'fDescription', value: item.fDescription},
      {key: 'f_spDocStatus', value: 1},
      {key: 'f_spProjects', value: item.f_spProjects},
    ]
    //console.log(this.cardDefaultData)
    this.selectContractDialogState = false
    this.cardStateEdit = true
  }

  async refreshCard(insertResult:any) {
    //console.log("insertResult",insertResult)
    if (insertResult !== undefined) {
      //Если вернулся ключь то делаем из этого заказа спецификацю как в выбранном договоре
      //console.log("insertResultKey", insertResult.data)
      await ordersController.newOrderFromContract(insertResult.data)
    }
    this.cardStateEdit = !this.cardStateEdit
  }

  async orderSpecCard() {
    if (!this.orderSpecCardState && this.specDataTable.length > 0) {
      this.selectedKeys = this.specDataTable.map((el)=>el.f_spWorks)
    }
    this.orderSpecCardState = !this.orderSpecCardState
  }

  async calcOrderGrafic() {
    if (!this.orderSpecCardState && this.specDataTable.length > 0) {
      //console.log("calcOrderGrafic", this.lastOrder.fkey)
      await ordersController.calcOrderGrafic(this.lastOrder.fkey)
      this.refreshData(2)
      //this.refreshData(3)
    }
  }

  async addDataFromDialogTree(item: any) {
    if (item !== undefined) {
      const keys = item.map((el:any)=>el.id).toString()
      //console.log("item", this.lastStep.fkey, keys.toString())
      await ordersController.modifySpecFromTree(this.lastStep.fkey, keys.toString())
      this.refreshData(3)
    }
  }

  async openCardCriteria() { //Здесь их получаешь
    await this.getCriteria()
    this.openCardCriteriaCard = !this.openCardCriteriaCard
  }

  async getCriteria() {
    const result = await ordersController.getCriteria_Order(this.lastOrder.fkey)
    this.selectedCriteria = this.preparedDataToTable(result).valuesTable.map((el)=>({...el,ischeked: true}))
    this.selectedKeysCriteria = this.selectedCriteria.map((el)=>el.f_spCriteria)
  }

  async updateCardCriteria(item: any) {
    if (item !== undefined) {
      const keys = item.map((el:any)=>el.id).toString()
      //console.log("Case Criteria!", this.lastSpecKey, keys)
      await ordersController.modifyOrderCriteria(this.lastOrder.fkey, keys.toString())
    }
  }

  async openGant(){
    const result = await baseController.execReport(8, '{"f_boOrders":"' + this.lastOrder.fkey + '"}')
    this.diagramState = !this.diagramState
  }

  async openGantStep(inp_gantt_Type: any, allOrders = false) {
    this.gantt_allOrders = allOrders
    const orderKey = allOrders ? 0 : this.lastOrder.fkey
    const curCompany = allOrders ? this.selectedCompany : 0
    let result = await baseController.getReportGraf(orderKey, curCompany)
    let resultParsed = this.preparedDataToTable(result)
    this.stepDataGant = resultParsed.valuesTable
    this.gantt_Type = inp_gantt_Type
    this.diagramStateStep = true
  }

  closeGant() {
    this.diagramState = false
    this.diagramStateStep = false
  }

  async openSpendMatType() {
    const result = await baseController.getSpendMatType(0, this.lastOrder.fkey)
    let parsed = this.preparedDataToTable(result)
    this.dataForDialog = parsed.valuesTable
    this.dataForDialog.forEach( el => el.f_boOrders = this.lastOrder.fkey)
    this.headersForDialog = parsed.headersTable
    this.headersForDialog.push({
      readonly: false,
      ref: true,
      refname: undefined,
      tblName: undefined,
      tblNameCirilic: undefined,
      text: "Ссылка на заказ",
      type: "int",
      value: "f_boOrders",
      visible: false
    })
    this.openSpendMatTypeCard = !this.openSpendMatTypeCard
  }

  async  opentTZ(peportID: number) {
    this.lastRequestedParams = null
    await this.refreshParams(peportID)
    if (this.paramData.length > 0) {
      this.stateRequestParam = true
      this.requestParamHeaders = this.preparedParamHeaders(this.paramData)
      this.requestParamData = this.paramData.map( (el) => el.fDefault)
    }
  }

  //Выгрузить отчет в шаблон Word
  async opentTZ_load(peportID: number) {
    await baseController.execReportToFileDOCX(this.lastOrder.fkey,peportID)
  }

  async refreshParams(peportID: number) {
    let result = await baseController.getReportParams(peportID, '{"f_boOrders":"' + this.lastOrder.fkey + '"}')
    console.log(this.lastOrder)
    let resultParsed = this.preparedDataToTable(result)
    this.paramData = resultParsed.valuesTable
    this.paramHeaders = resultParsed.headersTable
    this.lastReportID = peportID
  }

  async closeRequestCard() {
    this.stateRequestParam = !this.stateRequestParam
  }

  async updateRequestCard(item: any) {
    this.closeRequestCard
    //анализируем что получили и пишем в this.lastRequestedParams
    if (item !== undefined) {
      //console.log("item",item)
      this.lastRequestedParams = JSON.stringify(item)
      console.log(item);
      item.f_spReports = this.lastReportID
      let result = await baseController.saveParamsValue(item)
    }
  }

  open_PTNSelect() {
    this.PTNSelectState = !this.PTNSelectState
  }

  performersCard_new() {
    this.performersState_new = !this.performersState_new
  }

  async openResPlan_load() {
    await ordersController.execReportResPlanToXLSX(this.lastOrder.fkey, this.selectedCompany)
  }

  PTNPatentCard() {
    this.PTNPatentState = !this.PTNPatentState
  }

  orderStepSpendCard() {
    this.orderStepSpendState = !this.orderStepSpendState
  }

  async newOrderFromOrder()
  {
    this.orderCopyState = !this.orderCopyState
  }

  async copyOrderForce(result: any = true) {
    if (result === true) {
      //console.log("copy order!", this.lastOrder.fkey)
      await ordersController.newOreedrFromOrder(this.lastOrder.fkey)
      this.refreshData(1)
      this.$router.push({name : "extendedCard", query : {stringId : this.lastOrder.fkey, reportId : "11", tableName : 'boOrders'}})
    }
    this.orderCopyState = !this.orderCopyState
  }

  getDots(){
    let dots = this.$store.getters.getControlDots as []
    //let result = dots.filter((t:any)=>t.href == this.$route.path)
    let result = dots.filter((t:any)=>this.$route.path.includes(t.href))
    this.dots = result[0]
    //console.log(this.dots)
    if (this.dots.fAccessType == 1) { this.readOnlyModule = false } else { this.readOnlyModule = true }
  }

}

</script>

<style scoped>

</style>