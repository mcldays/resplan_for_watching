<template>
  <div style="display:flex;">
      <BaseTable
        :table-data="this.dataTable"
        :headers="this.headers"
        :toolbar-vision="true"
        table-name="Пользователи"
        :control-button-vision="true"
        @needUpdateTable="preparedDataForTable"
        @navigateDeep="rowClickedUser"
        :customMenu="this.usersMenu"
        @changePassword="changePassword"
        :canCopyRows="true"
      />
      <div v-if="this.lastUser>0" class="mx-2">
        <BaseTable
          :table-data="this.specDataTable"
          :headers="this.specHeaders"
          :toolbar-vision="true"
          table-name="Доступ к Компаниям"
          :control-button-vision="true"
          @needUpdateTable="preparedDataForTableSpecCompany"
          :defaultData="this.specDefaultData"
        />
        <v-divider class="ma-5"/>
        <BaseTable
          :table-data="this.groupsDataTable"
          :headers="this.groupsHeaders"
          :toolbar-vision="true"
          table-name="Группы пользователя"
          :control-button-vision="true"
          @needUpdateTable="preparedDataForTableSpecGroups"
          :defaultData="this.specDefaultData"
        />
      </div>
    </div>
</template>


<script lang="ts">
import {Component, Prop} from 'vue-property-decorator'
import {mixins} from "vue-class-component";
import {tableMixin} from "@/mixins/tableMixin";
import {Header} from "@/models/TableDataModel";
import BaseTable from "@/ui/BaseTable.vue";
import {baseController} from "@/controllers/baseController";


@Component({
  components: { BaseTable }
})
export default class UsersForm extends mixins(tableMixin) {

  private dataTable: any[] = []
  private headers: Header[] = []
  private lastUser: any = []

    //spec Data
  private specDataTable: any[] = []
  private specHeaders: Header[] = []
  private specDefaultData : any[] = []
  private groupsHeaders: Header[] = []
  private groupsDataTable : any[] = []

  private usersMenu: any[] = [
    {title: 'Сбросить пароль', event: 'changePassword', icon: 'mdi-lock-remove'},
  ]

  created() {
    this.preparedDataForTable()
  }

  async preparedDataForTable() {
      let result = await baseController.GetDictTable('spUsers')
      let dataTableParsed = this.preparedDataToTable(result)
      this.dataTable = dataTableParsed.valuesTable
      this.headers = dataTableParsed.headersTable
  }

  async rowClickedUser(item: any) {
    this.lastUser = item.fkey
    this.specDefaultData = [{key: 'f_spUsers', value: this.lastUser}]
    this.preparedDataForTableSpecCompany()
    this.preparedDataForTableSpecGroups()
    console.log("this.specDataTable",this.specDataTable)
    console.log("this.specHeaders",this.specHeaders)
    console.log("this.groupsDataTable",this.groupsDataTable)
    console.log("this.groupsHeaders",this.groupsHeaders)
  }

    async preparedDataForTableSpecCompany() {
      let result = await baseController.getUserCompany(this.lastUser)
      let dataTableParsed = this.preparedDataToTable(result)
      this.specDataTable = dataTableParsed.valuesTable
      this.specHeaders = dataTableParsed.headersTable
  }

      async preparedDataForTableSpecGroups() {
      let result = await baseController.getGroupsForUser(this.lastUser)
      let dataTableParsed = this.preparedDataToTable(result)
      this.groupsDataTable = dataTableParsed.valuesTable
      this.groupsHeaders = dataTableParsed.headersTable
  }

  async changePassword() {
    baseController.changePassword(this.lastUser, "as123456")
  }

}
</script>

<style scoped>

</style>