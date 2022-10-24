<template>
  <div>
    <div>
      <BaseTable
          :table-data="this.dataTable"
          :headers="this.headers"
          :table-name="tableName"
          :toolbar-vision="!readOnlyModule"
          :control-button-vision="!readOnlyModule"
          @navigateDeep="rowClicked"
          @dbClick="dblClicked"
          :itemsPerPage = 5
          @needUpdateTable="refreshData(1)"
          :customMenu="this.contractMenu"
          @showContractDetail1="showContractDetail(1)"
          @showContractDetail2="showContractDetail(2)"
          @openSpendMatType="openSpendMatType"
          :selectedRowId="this.lastContract===undefined?-1:this.lastContract.fkey"
          :canCopyRows="true"
      />
    </div>
    <v-divider style="margin:10px;height:0px;"/>
    <div>
      <v-fade-transition>
      <div v-if="stepTableState" style="display:flex;">
        <div style="width:35%;">
          <BaseTable
            :table-name="this.tableNameStep"
            :table-data="this.stepDataTable"
            :headers="this.stepHeaders"
            :control-button-vision="!readOnlyModule"
            :toolbar-vision="!readOnlyModule"
            @navigateDeep="rowClickedStep"
            @needUpdateTable="refreshData(2)"
            :defaultData="this.stepDefaultData"
            :selectedRowId="this.lastStep===undefined?-1:this.lastStep.fkey"
          />
        </div>
        <v-divider style="margin:10px;height:0px" vertical/>
        <div v-if="specTableState" style="width:65%;">
          <BaseTable
              :table-name="this.tableNameSpec"
              :table-data="this.specDataTable"
              :headers="this.specHeaders"
              :control-button-vision="!readOnlyModule"
              :toolbar-vision="!readOnlyModule"
              @navigateDeep="rowClickedSpec"
              @needUpdateTable="refreshData(3)"
              :defaultData="this.specDefaultData"
              :customMenu="this.contractSpecMenu"
              @openCardCriteria="openCardCriteria"
              :canCopyRows="true"
          />
        </div>
      </div>
      </v-fade-transition>
    </div>
    
    <v-dialog
        v-model="showContractDetailState"
        width="auto"
    >
      <v-data-table
        dense
        :items-per-page=-1
        :headers="this.headersForDialog"
        :items="this.dataForDialog"
        show-group-by
      >
      <template slot="body.append">
      <tr>
          <th></th>
          <th></th>
          <th></th> 
          <th></th>
          <th></th>
          <th>Итого:</th>
          <th>{{ sumField('fSum') }}</th>
      </tr>
      </template>
      </v-data-table>
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
        :iconPack = "1"
        :isselectable = "true"
        @closed="openCardCriteria"
        @chosenRow="updateCardCriteria"
        :selectedKeys="this.selectedKeys"
      />
    </v-dialog>

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
      />
    </v-dialog>

  </div>
</template>

<script lang="ts">
import {Component, Prop, Vue, Watch} from 'vue-property-decorator'
import BaseTable from "@/ui/BaseTable.vue";
import {TableDataModel, Header} from "@/models/TableDataModel";
import {contractsController} from "@/controllers/contractsController";
import {baseController} from "@/controllers/baseController";
import {mixins} from "vue-class-component";
import {tableMixin} from "@/mixins/tableMixin";
import LeftMenu from "@/ui/LeftMenu.vue"
import TreeView from "@/ui/TreeView.vue";


@Component({
  components: {BaseTable, LeftMenu, TreeView}
})
export default class ContractsMain extends mixins(tableMixin) {

  private dots : any = {}
  private readOnlyModule = true

  //Data for Contract
  private dataTable: any[] = []
  private headers: Header[] = []
  private tableName = ''
  private lastContract : any = []

  //Data for Steps
  private stepTableState  = false
  private stepDataTable : any[] = []
  private stepHeaders : Header[] = []
  private stepDefaultData : any[] = []
  private tableNameStep = ''
  private lastStep : any

  //Data for Spec
  private specTableState  = false
  private specDataTable : any[] = []
  private specHeaders : Header[] = []
  private specDefaultData : any[] = []
  private tableNameSpec = ''
  private selectedKeys : any[] = []
  private openCardCriteriaCard = false
  private lastSpecKey = 0

  //Data for dialog
  private dataForDialog: any[] = []
  private headersForDialog: any[] = []
  private showContractDetailState = false
  private openSpendMatTypeCard = false

  private contractMenu: any[] = [
    {title: 'Расходы по накладным', event:'openSpendMatType', icon: 'mdi-clipboard-list-outline'},
    {title: 'Суммарные расходы', event:'showContractDetail1', icon: 'mdi-clipboard-list'},
    //{title: 'Расходы по типу', event:'showContractDetail2', icon: 'mdi-account-plus'},
  ]

   private contractSpecMenu: any[] = [
    {title: 'Критерии операции', event:'openCardCriteria', icon: 'mdi-format-list-checks'},
  ]


  async mounted(){
    await this.$store.dispatch('reRenderDots').then(()=>{
      this.getDots()
    }).catch((err)=>{
      console.log(err)
    })
  }

  async created() {
    await this.prepareDataForTable()
  }

  async prepareDataForTable() {
    let dataTable = await contractsController.GetAll()
    let result = this.preparedDataToTable(dataTable)
    this.dataTable = result.valuesTable
    this.headers = result.headersTable
    this.tableName = String(result.headersTable[0].tblNameCirilic)
    this.rowClicked(this.lastContract);
  }

  async rowClicked(item : any) {    
    if (this.lastContract != item || this.lastContract.length === 0) {
      if (this.lastContract.length === 0) { this.lastContract = this.dataTable[0] }
      else {this.lastContract = item}
      let resultStep = await contractsController.GetContractsStep(0,this.lastContract.fkey)
      let parsedStep = this.preparedDataToTable(resultStep)
      this.stepDataTable = parsedStep.valuesTable
      this.stepHeaders = parsedStep.headersTable 
      this.tableNameStep = String(this.stepHeaders[0].tblNameCirilic)    
      this.stepDefaultData = [{key: 'f_boContracts', value: this.lastContract.fkey}]
      this.stepTableState = true

      //select first step
      this.rowClickedStep(this.stepDataTable[0])
    }
  }

  async rowClickedStep(item : any) {
    //this.specTableState = false
    if (this.lastStep != item) {
      this.lastStep = item
      let result = await contractsController.GetContractsSpec(0,item.fkey)
      let parsed = this.preparedDataToTable(result)
      this.specDataTable = parsed.valuesTable
      this.specHeaders = parsed.headersTable
      this.specTableState = true
      this.tableNameSpec = String(this.specHeaders[0].tblNameCirilic)
      this.specDefaultData = [{key: 'f_boContract_Step', value: this.lastStep.fkey}]
      this.lastSpecKey = this.specDataTable[0].fkey
    }
  }

  async rowClickedSpec(item : any)
  {
    this.lastSpecKey = item.fkey
  }

  async refreshData(TableType:any) {
    //console.log("needUpdate ContractsMain")
    if (TableType === 1) {
      let result = await contractsController.GetAll()
      this.dataTable = this.preparedDataToTable(result).valuesTable
    } else if (TableType === 2) {
      let result = await contractsController.GetContractsStep(0,this.lastContract.fkey)
      this.stepDataTable = this.preparedDataToTable(result).valuesTable
    } else if (TableType === 3) {
      let result = await contractsController.GetContractsSpec(0,this.lastContract.fkey)
      this.specDataTable = this.preparedDataToTable(result).valuesTable
      this.lastSpecKey = this.specDataTable[0].fkey
    } else if (TableType === 4) {
      let result = await baseController.getSpendMatType(this.lastContract.fkey,0)
      this.dataForDialog = this.preparedDataToTable(result).valuesTable
    }
  }

  async showContractDetail(ftype:any) {
    let result = await contractsController.getContractNaklad(ftype, this.lastContract.fkey)
    let parsed = this.preparedDataToTable(result)
    this.dataForDialog = parsed.valuesTable
    this.headersForDialog = parsed.headersTable
    this.showContractDetailState = !this.showContractDetailState
  }

  sumField(key:any) {
    return parseInt(this.dataForDialog.reduce((a, b) => a + (Number(b[key]) || 0), 0))
  }

  dblClicked(item : any) {
    this.$router.push("/contracts/restrict/" + item.fkey);
  }

  async openCardCriteria() {
    if (!this.openCardCriteriaCard && this.specDataTable.length > 0) {
      //console.log("this.lastSpecKey",this.lastSpecKey)
      const result = await contractsController.getCriteria_Contract(this.lastSpecKey)
      const selectedK = this.preparedDataToTable(result).valuesTable.map((el)=>el.f_spCriteria)
      //console.log("selectedK",selectedK)
      this.selectedKeys = selectedK
    }
    this.openCardCriteriaCard = !this.openCardCriteriaCard
  }

  async updateCardCriteria(item: any) {
    if (item !== undefined) {
      const keys = item.map((el:any)=>el.id).toString()
      //console.log("Case Criteria!", this.lastSpecKey, keys)
      let Parents = await contractsController.modifyContractCriteria(this.lastSpecKey, keys.toString())
    }
  }

  async openSpendMatType() {
    const result = await baseController.getSpendMatType(this.lastContract.fkey,0)
    let parsed = this.preparedDataToTable(result)
    this.dataForDialog = parsed.valuesTable
    this.dataForDialog.forEach( el => el.f_boContracts = this.lastContract.key)
    this.headersForDialog = parsed.headersTable
    this.headersForDialog.push({
      readonly: true,
      ref: true,
      refname: undefined,
      tblName: undefined,
      tblNameCirilic: undefined,
      text: "Ссылка на Договор",
      type: "int",
      value: "f_boContracts",
      visible: false
    })
    this.openSpendMatTypeCard = !this.openSpendMatTypeCard
  }

  getDots() {
    let dots = this.$store.getters.getControlDots as []
    //let result = dots.filter((t:any)=>t.href == this.$route.path)
    let result = dots.filter((t:any)=>this.$route.path.includes(t.href))
    this.dots = result[0]
    if (this.dots.fAccessType == 1) { this.readOnlyModule = false } else { this.readOnlyModule = true }
  }

}

</script>

<style scoped>

</style>