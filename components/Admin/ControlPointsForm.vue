<template>
  <div style="display:flex;">
    <TreeView
      bdName ="spControlPoints"
      myTitle="Контрольные точки"
      :expand-all="true"
      :dynamic-loading="true"
      tree-height="max-content"
      :iconPack= "1"
      :readOnly="false"
      @selectedItem="selectedTreeRow"
      treeHeight="800px"
    />
    <div v-if="this.lastCP>0">
      <v-card width="600px" class="mx-2">
        <v-card-title>{{this.ControlPointDesc}}</v-card-title>
        <v-card-text>
          <BaseTable
            :table-data="this.dataCP"
            :headers="this.headersCP"
            :toolbar-vision="true"
            table-name="Группы"
            :control-button-vision="true"
            :defaultData="this.CPDefaultData"
            @needUpdateTable="preparedDataForCP"
          />
        </v-card-text>
      </v-card>
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
import TreeView from "@/ui/TreeView.vue";


@Component({
  components: { BaseTable, TreeView }
})
export default class ControlPointsForm extends mixins(tableMixin) {

  //Control Params
  private lastCP = 0
  private dataCP: any[] = []
  private headersCP: any[] = []
  private CPDefaultData : any[] = []
  private ControlPointDesc = ""

  created() {
    this.preparedDataForCP()
  }

  async selectedTreeRow(item: any) {    
    //console.log("selectedTreeRow",item)
    this.lastCP = item.id
    this.CPDefaultData = [{key: 'f_spControlPoints', value: item.id}]
    const resultDesc = await baseController.getRelValue("spControlPoints",item.id)
    this.ControlPointDesc = resultDesc.data[1].fDescription ===""?resultDesc.data[1].fName:resultDesc.data[1].fDescription
    this.preparedDataForCP()
  }

  async preparedDataForCP() {
    let result = await baseController.getGroupControlPoint(this.lastCP)
    let dataTableParsed = this.preparedDataToTable(result)
    this.dataCP = dataTableParsed.valuesTable
    this.headersCP = dataTableParsed.headersTable
  }

}
</script>

<style scoped>

</style>