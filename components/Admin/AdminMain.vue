<template>
  <div>
    <v-card>
      <v-tabs center-active dark>
        <v-tab v-for="(tab,key) in this.tabNames" :key="key" @click="openTab(tab)"> 
          <v-icon class="mx-2">{{tab.icon}}</v-icon>
          {{tab.fDesc}} 
        </v-tab>
      </v-tabs>
    </v-card>

    <!-- 0 импорт -->
    <div v-if="curentTab===0">
      <ImportForm/>
    </div>

    <!-- 1 Спрвочник пользователей -->
    <div v-if="curentTab===1">
      <UsersForm/>
    </div>

    <!-- 2 Группы пользователей -->
    <div v-if="curentTab===2">
      <GroupsForm/>
    </div>

    <!-- 3 Контрольные точки -->
    <div v-if="curentTab===3">
      <ControlPointsForm/>
    </div>

    <!-- 4 Системные настройки -->
    <div v-if="curentTab===4">
      <div style="display: flex">
        <v-card>
          <v-tabs center-active vertical>
            <v-tab v-for="(tab,key) in this.sysTables" :key="key" @click="openTable(tab)"> {{tab.fDesc}} </v-tab>
          </v-tabs>
        </v-card>
        <BaseTable
          v-if="sysTablesHeader.length>0"
          :table-data="this.sysTablesData"
          :headers="this.sysTablesHeader"
          :toolbar-vision="true"
          :table-name="sysTableName"
          :control-button-vision="true"
          @needUpdateTable="openTable"
          :canCopyRows="true"
        />
      </div>
      <v-divider style="margin:10px;height:0px" vertical/>
      <v-card class="mx-0" max-width="30%">
        <v-card-title>Адреса серверов</v-card-title>
        <v-text-field class="pa-2" v-model="par1" label="Основной адрес" clearable/>
        <v-text-field class="pa-2" v-model="par2" label="Адрес на ts19" clearable/>
      </v-card>
    </div>

    <!-- 5 Логи -->
    <div v-if="curentTab===5">
      <LogsForm/>
    </div>

    <!-- 6 Канвас -->
    <div v-if="curentTab===6">
      <CanvasTestForm/>
    </div>

  </div>
</template>

<script lang="ts">
import {Component} from 'vue-property-decorator'
import {mixins} from "vue-class-component";
import {tableMixin} from "@/mixins/tableMixin";
import {Header} from "@/models/TableDataModel";
import BaseTable from "@/ui/BaseTable.vue";
import {baseController} from "@/controllers/baseController";
import AccountForm from "@/components/Autorization/AccountForm.vue"
import ImportForm from "@/components/Admin/ImportForm.vue"
import UsersForm from "@/components/Admin/UsersForm.vue"
import GroupsForm from "@/components/Admin/GroupsForm.vue"
import ControlPointsForm from "@/components/Admin/ControlPointsForm.vue"
import LogsForm from "@/components/Admin/LogsForm.vue"
import CanvasTestForm from "@/ui/canvas/CanvasTestForm.vue"


@Component({
  components: { BaseTable, AccountForm, ImportForm, UsersForm, GroupsForm, ControlPointsForm, LogsForm, CanvasTestForm }
})
export default class AdminMain extends mixins(tableMixin) {

  private tabNames : any[] = [
    {ID: 0, fDesc: "Импорт", icon: "mdi-database-import-outline"},
    {ID: 1, fDesc: "Пользователи", icon: "mdi-account-outline"},
    {ID: 2, fDesc: "Группы пользователей", icon: "mdi-account-group-outline"},
    {ID: 3, fDesc: "Контрольные точки", icon: "mdi-camera-control"},
    {ID: 4, fDesc: "Настройки системы", icon: "mdi-cog-outline"},
    {ID: 5, fDesc: "Логи", icon: "mdi-semantic-web"},
    {ID: 6, fDesc: "Канвас", icon: "mdi-panorama-variant-outline"},
  ]
  private sysTables : any[] = [
    {ID: 0, fDesc: "Список справочников", tblName: "spDict"},
    {ID: 1, fDesc: "Таблица локализации", tblName: "spAlias"},
    {ID: 2, fDesc: "Фильтры", tblName: "spFK_Filters"},
    {ID: 3, fDesc: "Типы файлов", tblName: "spFileType"},
    {ID: 4, fDesc: "Файлы", tblName: "spFiles"},
  ]

  //Main Data
  private curentTab = 0

  //System Params
  private par1 = "10.226.95.133"
  private par2 = "10.226.195.120:30080"

  //sysTables
  private sysTableName = ""
  private sysTableBDName = ""
  private sysTablesHeader: any[] = []
  private sysTablesData: any[] = []

  async created() {
    //await this.preparedDataForTable()
  }

  async openTab(tab: any) {
    //console.log("item",tab)
    this.curentTab = tab.ID
  }

  async openTable(tab: any) {
    const dbTblName = tab.tblName == undefined ? this.sysTableBDName : tab.tblName
    let result = await baseController.GetDictTable(dbTblName)
    let dataTableParsed = this.preparedDataToTable(result)
    if (tab != undefined) { this.sysTableName = tab.fDesc }
    this.sysTableBDName = dbTblName
    this.sysTablesData = dataTableParsed.valuesTable
    this.sysTablesHeader = dataTableParsed.headersTable
  }
  
}
</script>

<style scoped>

</style>