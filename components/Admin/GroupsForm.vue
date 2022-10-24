<template>
  <div style="display:flex;">
    <BaseTable
      :table-data="this.dataTable"
      :headers="this.headers"
      :toolbar-vision="true"
      table-name="Группы"
      :control-button-vision="true"
      @needUpdateTable="preparedDataForTable"
      @navigateDeep="rowClickedGroup"
      :canCopyRows="true"
    />
    <div v-if="this.lastGroup>0">
      <BaseTable
        :table-data="this.specDataTable"
        :headers="this.specHeaders"
        :toolbar-vision="true"
        :table-name="'Пользователи в группе: ' + this.lastGroupName"
        :control-button-vision="true"
        @needUpdateTable="preparedDataForTableSpec"
        :defaultData="this.specDefaultData"
        class="mx-2"
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
export default class GroupsForm extends mixins(tableMixin) {

  private dataTable: any[] = []
  private headers: Header[] = []
  private lastGroup = 0
  private lastGroupName = ""

    //spec Data
  private specDataTable: any[] = []
  private specHeaders: Header[] = []
  private specDefaultData : any[] = []

  created() {
    this.preparedDataForTable()
  }

  async preparedDataForTable() {
    await this.prepareGroups()
    this.lastGroup = this.dataTable[0].fkey
    this.lastGroupName = this.dataTable[0].fName
    this.specDefaultData = [{key: 'f_spGroups', value: this.lastGroup}]
    this.preparedDataForTableSpec()
  }

  async prepareGroups() {
    let result = await baseController.GetTable('spGroups')
    let dataTableParsed = this.preparedDataToTable(result)
    this.dataTable = dataTableParsed.valuesTable
    this.headers = dataTableParsed.headersTable
  }

  async preparedDataForTableSpec() {
    let result = await baseController.getUserGroup(this.lastGroup)
    let dataTableParsed = this.preparedDataToTable(result)
    this.specDataTable = dataTableParsed.valuesTable
    this.specHeaders = dataTableParsed.headersTable
  }

  async rowClickedGroup(item : any) {
    this.lastGroup = item.fkey
    this.lastGroupName = item.fName
    this.specDefaultData = [{key: 'f_spGroups', value: this.lastGroup}]
    this.preparedDataForTableSpec()
  }

}
</script>

<style scoped>

</style>