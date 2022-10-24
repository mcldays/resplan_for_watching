<template>
  <div style="display:flex;">
    <div style="width:50%">
      <v-card>
        <v-card-title>
          <v-text-field
            v-model="searchLog"
            append-icon="mdi-magnify"
            label="Поиск"
            single-line
            hide-details
          />
        </v-card-title>
        <v-data-table
          :search="searchLog"
          :items="this.dataTable"
          :headers="this.headers"
          :items-per-page="15"
        >
          <template v-slot:body="{items}">
            <tbody>
              <tr
                v-for="(item,index) in items"
                :key="index"
                @click="clickLog(item)"                
              >
                <td v-for="(value,name,index1) in item"
                  :key="index1"
                  :class="(hideCols.includes(name) ? 'text- d-none' : '')"
                >
                  <v-icon v-if="item.existInfo == 1 && name == 'status'" color="#87CEEB">mdi-information-outline</v-icon>
                  {{ value }}
                </td>
              </tr>
            </tbody>
          </template>
        </v-data-table>
      </v-card>
    </div>
    <div style="width:50%" class="mx-5">
      <v-card v-if="this.dataInfo.length > 0">
        <v-data-table
          :items="this.dataInfo"
          :headers="this.headersInfo"
          :items-per-page="-1"
        />
      </v-card>
    </div>
  </div>
</template>


<script lang="ts">
import {Component, Prop} from 'vue-property-decorator'
import {mixins} from "vue-class-component";
import {tableMixin} from "@/mixins/tableMixin";
import {baseController} from "@/controllers/baseController";


@Component({
  components: { }
})
export default class LogsForm extends mixins(tableMixin) {

  private dataTable: any[] = []
  private headers: any[] = []
  private searchLog = ""
  private hideCols = ['message','existInfo']

  private dataInfo: any[] = []
  private headersInfo: any[] = [ { text: 'key', value: 'key' }, { text: 'value', value: 'value' } ]

  created() {
    this.preparedDataForTable()
  }

  async preparedDataForTable() {
      //let result = await baseController.GetDictTable('spLogs')
      let result = await baseController.GetLogs()
      let dataTableParsed = this.preparedDataToTable(result)
      let tmp_dataTable = dataTableParsed.valuesTable
      let tmp_headers = dataTableParsed.headersTable
      
      this.hideColumns(tmp_headers, this.hideCols)
      this.dataTable = tmp_dataTable
      this.headers = tmp_headers
  }

  clickLog(item: any) {
    if (item.message != "") {
      let list: any[] = []
      this.addParams(list,item.message)
      this.dataInfo = list
    } else {
      this.dataInfo = []
    }
  }

  addParams(list:any, item: any) {
    try {
      const cur = (typeof item) === 'object' ? item : JSON.parse(item)
      Object.entries( cur ).forEach(([key, value]) => {
        if ((typeof value) === 'object') {
          this.addParams(list,value)
        } else {
          list.push({ key: key, value: value})
        }
      })
    }
    catch {
      list.push({key: 'text', value: item})
    }
  }

}
</script>

<style scoped>

</style>