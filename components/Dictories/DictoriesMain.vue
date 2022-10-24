<template>
  <div >

    <v-card>
      <v-tabs
        center-active
        right
        next-icon="mdi-arrow-right-bold-box-outline"
        prev-icon="mdi-arrow-left-bold-box-outline"
        slider-color="blue"
        show-arrows
        dark
        v-model="currentTab"
      >
        <v-tab
          v-for="(tab,key) in this.tableNames"
          :key="key"
          @click="openTable(tab)"
        >
          <v-icon class="mx-2">{{tab.fIcon}}</v-icon>
          {{tab.fDesc}}
        </v-tab>
      </v-tabs>
    </v-card>

    <v-slide-y-transition>

      <!--Справочник c классификатором отдельно-->
      <div v-if="isMaterials" style="display:flex;">        
        <div style="width:30%;">
          <TreeView
            treeWidth="max-content"
            :bdName ="this.dbName"
            myTitle="Классификатор"
            :expand-all="false"
            :dynamic-loading="true"
            tree-height="max-content"
            :iconPack = "1"
            :readOnly="this.readOnlyTab"
            @selectedItem="selectedTreeRow"
            treeHeight="700px"
          />
        </div>
        <div style="width:70%">
          <BaseTable
            :table-data="this.dataTable"
            :headers="this.headers"
            :toolbar-vision="true"
            :control-button-vision="!this.readOnlyTab"
            :table-name="this.tableName"
            @needUpdateTable="loadChilds"
            :canCopyRows="true"
            class="mx-2"
          />
         </div>
      </div>
      
      <!--Все остальные справочники-->
      <div v-else>
        <BaseTable
          v-if="!this.viewType"
          :table-data="this.dataTable"
          :headers="this.headers"
          :toolbar-vision="!this.readOnlyTab"
          :table-name="this.tableName"
          :control-button-vision="!this.readOnlyTab"
          @needUpdateTable="refreshData"
          :canCopyRows="true"
        />
        <!-- treeView списка операций -->
        <TreeView
          v-if="this.viewType"
          treeWidth="max-content"
          :bdName ="this.dbName"
          :myTitle="this.tableName"
          :expand-all="false"
          :dynamic-loading="true"
          tree-height="max-content"
          :iconPack = "1"
          :readOnly="this.readOnlyTab"
        />             
      </div>
    </v-slide-y-transition>

  </div>
</template>

<script lang="ts">
import {Component, Prop, Vue, Watch} from 'vue-property-decorator'
import {mixins} from "vue-class-component";
import {tableMixin} from "@/mixins/tableMixin";
import {Header} from "@/models/TableDataModel";
import TreeView from "@/ui/TreeView.vue";
import BaseTable from "@/ui/BaseTable.vue";
import {baseController} from "@/controllers/baseController";
import {TreeChild,TreeParent,TreeViewDataModel} from "@/models/TreeViewDataModel";
import {techCardsController} from "@/controllers/techCardsController";
import router from '@/router';

@Component({
  components: {BaseTable, TreeView}
})
export default class DictoriesMain extends mixins(tableMixin) {
  private dataTable: any[] = []
  private headers: Header[] = []
  private tableNames : any[] = []
  private dbName = ''
  private viewType  = false
  private tableName = ''
  private lastTab = []
  private readOnlyTab = true
  private currentTab: any = 0
  private isMaterials = false
  private lastType = 1
  private listdbName = ""

  async created() {
    await this.preparedDataForTable()
  }

  async preparedDataForTable() {
    const tableNameResult = await baseController.GetDist()
    this.tableNames = this.preparedNamesTable(tableNameResult)
    this.tableNames.forEach((el,index)=>{
        if (el.fName === this.$route.params.Pid)
          this.currentTab = index
      })
    const curDict = this.tableNames[this.currentTab]
    this.viewType = curDict.fisTree === "True"? true: false
    this.openTable(curDict)
  }

  async openTable(tab: any) {
    if (this.$route.params.Pid !== tab.fName) this.$router.push(tab.fName);
    this.lastTab = tab
    this.readOnlyTab = tab.fAccessType == '0' ? true : false

    //Если это справочник с классификатором то его отображаем по особенному
    if(tab.fTreeName !== "") {
      this.isMaterials = false
      setTimeout(() => {
            this.isMaterials = true
          }, 100);
      this.tableName = ""
      this.dbName = tab.fTreeName
      this.listdbName = tab.fName
      //this.loadChilds()
    } else {
      this.isMaterials = false
      this.viewType = tab.fisTree == "True"? true: false
      if (this.viewType) {
          //таймаут чтобы перерисовать "другое" дерево      
          this.viewType = !this.viewType
          setTimeout(() => {
            this.viewType = !this.viewType
          }, 100);
          //for tree data
          this.dbName = String(tab.fName)
          this.tableName = String(tab.fDesc)
      } else
      {
        this.loadFlatData(tab.fName,tab.fDesc)
      }
    }
  }

  async loadFlatData(table: any, desc: any) {
    let result = await baseController.GetDictTable(table)
    let dataTableParsed = this.preparedDataToTable(result)
    this.tableName = desc
    this.dataTable = dataTableParsed.valuesTable
    this.headers = dataTableParsed.headersTable
  }

  async selectedTreeRow(item: any) {
    this.tableName = item.name
    this.lastType = item.id
    this.loadChilds()
  }

  async loadChilds() {
    let result = await baseController.getDictTable_filtered(this.listdbName,0,this.dbName,this.lastType)
    let dataTableParsed = this.preparedDataToTable(result)
    this.dataTable = dataTableParsed.valuesTable
    this.headers = dataTableParsed.headersTable
  }

  async refreshData() {
    this.openTable(this.lastTab)
  }

}
</script>

<style scoped>


</style>