<template>
  <div class="text">
    <v-autocomplete
      v-model="paramData.valueID"
      :items="this.items"
      prepend-icon="mdi-book-open"
      clearable
      @click:clear="clearRef"
      @focus="init"
      no-data-text="-- нет записей --"
      :label="paramData.key.text"
      :cache-items="true"
      :hide-selected="true"
    >
      <template v-slot:append-outer>
        <v-btn @click="openSelectForm(paramData.key)" icon>
          <v-icon>mdi-share-variant</v-icon>
        </v-btn>
      </template>
    </v-autocomplete>

    <v-dialog
      v-model="dialog"
      width="1500px"
    >
      <select-table
        :headers="headersForDialog"
        :table-data="dataForDialog"
        :isTree="dialogIsTree"
        :dbName="dialogDBName"
        @chosenRow="addDataFromDialog"
      />
    </v-dialog>

  </div>
</template>

<script lang="ts">
import {Component, Prop, Vue} from 'vue-property-decorator';
import {baseController} from "@/controllers/baseController";
import {mixins} from "vue-class-component";
import {tableMixin} from "@/mixins/tableMixin";
import SelectTable from "@/ui/SelectTable.vue";

@Component({
  components: { SelectTable },
})

export default class ParamReference extends mixins(tableMixin) {

  @Prop() paramData: any
  @Prop() tableName: any
  @Prop() primaryKey: any
  
  private items: any [] = []
  private dialog = false
  private dialogDBName = "none"
  private dialogIsTree = false
  private dataForDialog: any[] = []
  private headersForDialog: any[] = []
  private notInit = true
  private isInit = false

  async created() {
    if (this.paramData.value !== '') {
      let request = await baseController.getRelValue(this.paramData.key.value, this.paramData.value)
      const curName = request.data[1].fName
      this.items = [ { value: this.paramData.valueID, text: curName } ]
    }
    this.init()
  }

  async init() {
    if (this.notInit) {
      //Если таблица не определена то запрос делаем без фильтра
      let rs
      if (this.tableName === null || this.tableName === "")
        { rs = await baseController.getRelValue(this.paramData.key.value, 0) }
      else
        { rs = await baseController.getRelValue_filtered(this.paramData.key.value, 0, this.tableName, this.primaryKey, false) }
      let parsed = this.preparedDataToTable(rs)
      const new_rows = parsed.valuesTable.map( (t:any) => ( { value:t.fkey, text:t.fName} ))
      if (this.items.length > 0) {
        this.items = new_rows.filter((el)=>el.value!=this.items[0].value)
      } else {
        this.items = new_rows
      }

      this.notInit = false
    }
  }

  async openSelectForm(head: any) {
    if (!this.isInit) {
      //проверка на дерево ли это или плоский список
      const responseName = await baseController.getTblNameFromRel(head.value)
      this.dialogDBName = responseName.data
      const tableNameResult = await baseController.GetDist()
      const tableNames: any[] = tableNameResult.data
      const curTable = tableNames.find(t => t.fName === this.dialogDBName)
      this.dialogIsTree = curTable?.fisTree === "True"

      //Если не дерево то подготавливаем для него данные
      if (!this.dialogIsTree) {
        let result = await baseController.getRelValue_filtered(head.value, 0, this.tableName, this.primaryKey, false)
        let parsed = this.preparedDataToTable(result)
        this.dataForDialog = parsed.valuesTable
        this.headersForDialog = parsed.headersTable
      }
      this.isInit = true
    }

    this.dialog = true
  }

  getChild(result: any[], parentKey: number) {
    let some = []
    result.filter((el:any) => el.parent = parentKey)
    result.forEach((elem,index) => {
      some.push({
      id: elem.fkey,
      name: (elem.fCode !== undefined ? elem.fCode + " " : "") + (elem.fName !== undefined ? elem.fName : ""),
      key: elem.fkey,
      number: index.toString(),
      children: elem.Child === "1"? [] : undefined
      });
    });
  }

  addDataFromDialog(item: any) {
    this.paramData.value = item.fName
    this.paramData.valueID = item.fkey
    this.dialog = !this.dialog
  }

  clearRef() {
    this.paramData.valueID = 0
  }

}

</script>

<style scoped>

</style>