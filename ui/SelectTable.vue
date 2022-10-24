<template>
  <v-card>
    <v-card-title
      v-if="!isTree"
      style="position: sticky; top: 0;" 
      class="pa-5"
    >
      {{ 'Выбрать из ' + this.dialogName }}
      <v-spacer></v-spacer>
      <v-text-field
        v-model="search"
        label="Поиск"
        single-line
        clearable
        hide-details
      ></v-text-field>
      <v-btn icon @click="prevSheet" :disabled="!(this.page>1)">
        <v-icon>mdi-arrow-left-thin</v-icon>
      </v-btn>
      <v-btn icon @click="nextSheet" :disabled="!(this.page<this.pageNumbers)">
        <v-icon>mdi-arrow-right-thin</v-icon>
      </v-btn>
    </v-card-title>

    <div>

      <div v-if="isTree">
        <TreeView
          :myTitle="'Выбрать из ' + this.dialogName"
          :bdName="this.dbName"
          :dynamic-loading="true"
          tree-height="max-content"
          :iconPack ="1"
          :isSoloSelect="true"
          @selectedItem="selectItem"
        />
      </div>

      <div v-else class="selectTable" @mousewheel="mousewheel">
        <v-data-table
          id="selectTable"
          :headers="localHeaders"
          :items="localData"
          dense
          :items-per-page=15
          :page="page"
          @update:items-per-page="updateItems"
          @update:page="calculatePagination"
          :search="search"
        >
          <template v-slot:body="{ items }">
            <tbody>
            <tr
                @click="rowClick(item)"
                class="trHover"
                v-for="item in items"
                :key="item.id"
            >
              <td
                  v-for="n in item"
                  :key="n.id"
              >
                {{ n }}
              </td>
            </tr>
            </tbody>
          </template>
        </v-data-table>
      </div>
      
    </div>

  </v-card>
</template>

<script lang="ts">
import {mixins} from "vue-class-component";
import {tableMixin} from "@/mixins/tableMixin";
import {Component, Prop, Vue, Watch} from 'vue-property-decorator'
import {Header} from "@/models/TableDataModel";
import {baseController} from "@/controllers/baseController";
import TreeView from "@/ui/TreeView.vue";

@Component({
  components: {TreeView}
})
export default class SelectTable extends mixins(tableMixin) {
  @Prop() tableData: any[]
  @Prop() headers: Header[]
  @Prop() viewType: boolean
  @Prop() isTree: boolean
  @Prop() dbName: any
  private localData: any[] = []
  private localHeaders: Header[] = []
  private loading: boolean
  private search = ""
  private dialogName = 'сущности'

  //Hidden Headers
  private hiddenData: any[] = []
  private hiddenHeaders: Header[] = []

  private page = 1
  private pageNumbers = 1
  private perPage = 15

  async created() {
    await this.preparedDataForTable()
  }

  @Watch("tableData", {deep: true})
  @Watch("isTree", {deep: true})
  async preparedDataForTable() {
    if (!this.isTree) {
      if (this.headers.length > 0) {
        this.dialogName = String(this.headers[0].tblNameCirilic)
      }
      this.localData = this.tableData
      this.localHeaders = this.headers
      this.calculatePagination()
    }
    //console.log("this.isTree",this.isTree)
  }

  rowClick(item: any): void {
    this.$emit("chosenRow", item)
  }

  selectItem(item:any) {
    this.$emit("chosenRow", {fName: item.name, fkey: item.id})
  }
  updateItems(data :any){
    this.page = 1
    this.perPage = data
    this.calculatePagination()
  }

  calculatePagination() {
    let dataCount = this.tableData.length
    let pageNumbers = dataCount/this.perPage;
    this.pageNumbers = Math.ceil(pageNumbers)
    //console.log(this.$refs.table)
  }

  nextSheet() {
    if(this.page > this.pageNumbers){
      return
    }
    else{
      this.page ++
    }
  }
  prevSheet() {
    if(this.page == 1){
      return
    }
    else{
      this.page--
    }
  }

  mousewheel(item: any) {
    if (item.deltaY > 0) {this.nextSheet()}
    else {this.prevSheet()}
  }

}
</script>

<style scoped>
.trHover:hover{
  cursor: pointer;
  background-color:sandybrown!important;
}

</style>