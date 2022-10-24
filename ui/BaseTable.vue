<template>
  <div>
    <MessageBox
        :v-model="itemDeleteDialog"
        :title="'Удалить элемент ' + tableName + ' №' + itemDeleteID + ' ?'"
        message="Хорошо подумайте прежде чем выполнить действие удаления, т.к. данная запись будет удалена, и не будет подлежать восстановлению."
        @result="deletItemForce"
    />
    <MessageBox
        :v-model="itemCloneDialog"
        :title="'Сделать копию объекта ' + tableName + ' №' + selectedId + ' ?'"
        message="Элемент будет скопирован с полным дублированием всех реквизитов, но без связаных объектов."
        @result="cloneItemForce"
    />
    <notification-hub text="Элемент скопирован" :state="snackState"/>
    <div v-if="isExtended">
      <v-fade-transition>

        <router-view
            v-if="!baseTableState"
            @back="goBackCard"
            @closed="refreshEditExtend"
            @needUpdateCard="refreshData"
        ></router-view>
      </v-fade-transition>

    </div>
    <v-data-table
        v-if="baseTableState"
        ref="table"
        :headers="hiddenHeaders"
        :items="hiddenData"
        :loading="loading"
        :search="search"
        dense
        :items-per-page="itemsPerPage"
        class="elevation-4"
        :page="page"
        @update:items-per-page="updateItems"
    >
      <v-data-table-header mobile />
      <template v-slot:top>
        <v-toolbar flat>
          <v-toolbar-title style="font-size:24px">{{ tableName }}</v-toolbar-title>
          <div class="anyButtons" >
            <slot name="anyButtons"></slot>
          </div>

          <v-spacer></v-spacer>
          <div v-if="toolbarVision">
            <v-scroll-x-transition>
              <v-text-field
                  v-if="searchState"
                  v-model="search"
                  label="Поиск"
                  single-line
                  clearable
                  hide-details
              ></v-text-field>
            </v-scroll-x-transition>

            <v-btn icon @click="prevSheet" :disabled="!(page>1)">
              <v-icon>mdi-arrow-left-thin</v-icon>
            </v-btn>
            <v-btn icon @click="nextSheet" :disabled="!(page<pageNumbers)">
              <v-icon>mdi-arrow-right-thin</v-icon>
            </v-btn>
            <v-btn @click="openFilters" icon v-if="canFiltered">
              <v-icon :color="selectedFilters.length > 0 ? 'red' : ''">{{ selectedFilters.length > 0 ? 'mdi-filter' : 'mdi-filter-outline' }}</v-icon>
            </v-btn>
            <v-btn @click="openFinder" icon class="mdi-alert-rhombus-outline">
              <v-icon>mdi-magnify</v-icon>
            </v-btn>
            <v-btn icon @click="openCard(true,undefined)" v-if="controlButtonVision">
              <v-icon>mdi-plus</v-icon>
            </v-btn>

            <template v-if="customMenu && controlButtonVision">
                <v-menu offset-y>
                  <template v-slot:activator="{ on, attrs }">
                    <v-btn
                      icon
                      v-bind="attrs"
                      v-on="on"
                    >
                      <v-icon>mdi-dots-vertical</v-icon>
                    </v-btn>
                  </template>
                  <v-list>
                    <v-list-item-group>
                      <v-list-item
                        v-for="(item, index) in customMenu"
                        :key="index"
                      >
                        <v-list-item-title style="cursor: pointer" @click="clickMenu(item)">
                          <v-icon class="mx-2">{{item.icon}}</v-icon>
                          {{ item.title }}
                        </v-list-item-title>
                      </v-list-item>
                    </v-list-item-group>
                  </v-list>
                </v-menu>
            </template>

          </div>
        </v-toolbar>
      </template>
      <template v-slot:body="{items}">
        <tbody>
        <tr
            v-for="(item,index) in items"
            :key="index"
            @click="rowClick(item.fkey)"
            @dblclick="dbClickEvent(item)"
            :style="rowColor(item)"
        >
          
          <td v-if="inpVmodel">
            <v-checkbox
              :value="inpVmodel ? (inpVmodel.includes(item.fkey) == true ? true : false) : false"
              @click="rowClickFilter(item.fkey)"
            />
          </td>

          <td v-for="(value,name,index1) in item"
            :key="index1"
            :class="name === 'fkey' ? 'text- d-none' : ''"
          >

            <!-- Битовые поля -->
            <v-simple-checkbox
              v-if="checkBoxColumns.includes(name)"
              :value="value === 'True' ? true : false"
              :disabled="true"
            />

            <!-- Деньги -->
            <div v-else-if="moneyColumns.includes(name)">
              {{ value.replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, '$1 ') }}
            </div>

            <!-- Все остальное -->
            <div v-else>
              {{ value.length > 150 ? value.substring(0, 100) + '...' :  value}}
            </div>

          </td>

          <td v-if="controlButtonVision"
            class="controlIcons"
          >
          <v-tooltip bottom>
            <template v-slot:activator="{ on }">
            <v-icon
                small
                class="mr-2"
                v-on="on"
                @click="openCard(false,item.fkey)"
            >
              mdi-pencil
            </v-icon>
            </template>
            <span>Изменить</span>
          </v-tooltip>
          <v-tooltip bottom>
            <template v-slot:activator="{ on }">
            <v-icon
                small
                class="mr-2"
                v-on="on"
                @click="deleteItemDialogOpen(item.fkey)"
            >
              mdi-delete
            </v-icon>
            </template>
            <span>Удалить</span>
          </v-tooltip>
          <v-tooltip bottom>
            <template v-slot:activator="{ on }">
            <v-icon
                v-if="canCopyRows"
                small
                class="mr-2"
                v-on="on"
                @click="cloneItemDialogOpen(item.fkey)"
            >
              mdi-content-copy
            </v-icon>
            </template>
            <span>Скопировать строку</span>
          </v-tooltip>            
          </td>
        </tr>
        </tbody>
      </template>
      <template v-slot:footer >

      </template>
    </v-data-table>
    <v-dialog
        persistent
        v-model="cardStateEdit"
        max-width="50%"
        v-if="cardStateEdit"
    >
      <EditCard
          :headers="this.editHeaders"
          :for-edit="!cardStateAdd"
          :data="cardStateAdd===true?undefined:cardData"
          @closed="refreshEdit"
          @needUpdateCard="refreshData"
          :defaultRow="cardStateAdd===true?this.defaultData:undefined"
      />
    </v-dialog>

    <!-- Список фильтров -->
    <v-dialog
      v-model="filtersDialogState"
      width="60%"
    >
      <v-card>
        <BaseTable
          :tableName="'Фильтры на таблицу '+tableName"
          :inpVmodel="selectedFilters"
          :table-data="filtersData"
          :headers="filtersHeaders"
          :items-per-page="15"
          :canCopyRows="true"
          :toolbar-vision="controlButtonVision"
          :control-button-vision="controlButtonVision"
          @needUpdateTable="loadFilters(true)"
          :canFiltered="false"
        />
        <div style="display: flex; position: sticky; bottom: 0;" class="ma-5">
          <v-btn type="submit" depressed class="ma-5" color="grey" @click="resetFilters">Сбросить фильтры</v-btn>
          <v-spacer/>
          <v-btn type="submit" depressed class="ma-5" color="primary" @click="applyFilters">Применить фильтры</v-btn>
        </div>
      </v-card>
    </v-dialog>

  </div>

</template>

<script lang="ts">
import {Component, Prop, Vue, Watch} from 'vue-property-decorator'
import {TableDataModel, Header} from "@/models/TableDataModel";
import EditCard from "@/ui/EditCard.vue";
import {mixins} from "vue-class-component";
import {tableMixin} from "@/mixins/tableMixin";
import MessageBox from '@/ui/MessageBox.vue'
import ExtendedCard from "@/ui/ExtendedCard.vue";
import {baseController} from "@/controllers/baseController";
import NotificationHub from "@/views/NotificationHub.vue";

@Component({
  components: {
    ExtendedCard,
    EditCard, MessageBox, NotificationHub
  },
  name: "BaseTable",
})
export default class BaseTable extends mixins(tableMixin) {

  @Prop() tableData: any[]
  @Prop() headers: Header[]
  @Prop() tableName: string
  @Prop() toolbarVision: boolean
  @Prop() controlButtonVision: boolean
  @Prop({default: 15}) itemsPerPage: number
  @Prop() defaultData: any[]
  @Prop() customMenu: any[]
  @Prop({default: -1}) selectedRowId: any
  @Prop({default: false}) isExtended: boolean
  @Prop({default: null}) reportId: number
  @Prop({default: false}) canCopyRows: boolean
  @Prop() inpVmodel: any[]
  @Prop({default: true}) canFiltered: boolean

  private tableDBName = ""
  //private isLoaded = false

  //Card States
  private editHeaders: Header[] = []
  private cardData: any
  private cardStateEdit = false
  private cardStateAdd = false
  private selectedId = -1
  private snackState = false

  //Delete state
  private itemDeleteDialog = false
  private itemDeleteID = 0

  //Clone state
  private itemCloneDialog = false
  private itemCloneID = 0

  //Local Headers
  private localData: any[] = []
  private localHeaders: Header[] = []
  private needRowColor = false

  //Hidden Headers
  private hiddenData: any[] = []
  private hiddenHeaders: Header[] = []

  //Service
  private loading = true
  private search = ""
  private searchState = false
  private page = 1
  private pageNumbers = 1
  private perPage: number
  private itemCopyDialog = false
  private baseTableState = true
  private checkBoxColumns: string[] = []
  private moneyColumns: string[] = []

  //filters
  private isFiltersLoaded = false
  private filtersDialogState = false
  private filtersData: any[] = []
  private filtersHeaders: Header[] = []
  private selectedFilters: any[] = []

  @Watch("tableData", {deep: true})
  preparedDataForTable() {
    //Есл нет данных то нечего не делаем
    //if (this.tableData.length > 0 || !this.isLoaded) {
      //this.isLoaded = true
      //Обновление данных
      this.localData = this.tableData
      let result = this.parseAttributesOnTable(this.headers, this.localData)
      this.hiddenData = result.hiddenData

      this.selectedId = this.selectedRowId
      this.localHeaders = this.headers
      this.hiddenHeaders = result.filteredHeaders
      this.editHeaders = JSON.parse(JSON.stringify(this.headers))

      //спрятать ключ
      this.hideColumns(this.hiddenHeaders,["fkey"])

      if (this.inpVmodel) {
        let head: Header = {text: "Выбрать", value: "isSelected"}
        this.hiddenHeaders.unshift(head)
      }
      if (this.controlButtonVision) {
        let head: Header = {text: "Действия", value: "actions"}
        this.hiddenHeaders.push(head)
      }
      this.checkBoxColumns = this.getCheckBoxColumns(this.headers)
      this.moneyColumns = this.getMoneyColumns(this.headers)
      this.loading = false

      //Проверяем нужна ли раскраска строк, если нет то вообще не проверяем цвет строки
      if (this.localData.length > 0) {
        this.needRowColor = {}.propertyIsEnumerable.call(this.localData[0], "fColor")
      }

      const firstRes = this.headers.find((el) => el.value === "fkey")
      this.tableDBName = firstRes === undefined ? "" : String(firstRes.tblName)

      this.loadFilters()

      this.calculatePagination()
    /*}
    else {
      this.hiddenData = []
    }*/

  }

  async loadFilters(forceUpdate = false) {
    //Загружаем табличные фильтры
    if ((this.tableDBName != "" && !this.isFiltersLoaded ) || forceUpdate) {
      let filtersData = await baseController.getTableFilters(this.tableDBName)
      let filtersDataParsed = this.preparedDataToTable(filtersData)
      this.filtersData = filtersDataParsed.valuesTable
      this.filtersHeaders = filtersDataParsed.headersTable
      //this.hideColumns(this.filtersHeaders,["fTable","fWhere"])
      this.isFiltersLoaded = true
    }
  }

  //Функция Раскрашивает строки
  rowColor(item: any) {
    let rColor: any = ''
    if (this.needRowColor) {
      const curItem = this.localData.find((el) => el.fkey == item.fkey)
      rColor = (curItem === undefined) ? '' : (curItem.fColor !== undefined) ? {'color': curItem.fColor} : ''
    }
    //return [((item.fkey === this.selectedId) ? {'background-color': '#CCFFA3'} : ''), rColor]
    if(this.$vuetify.theme.dark != true){
      return [((item.fkey === this.selectedId) ? {'background-color': '#f5f5f0'} : ''), rColor]
    }
    else{
      return [((item.fkey === this.selectedId) ? {'background-color': '#7a7a78'} : ''), rColor]
    }

    //return [((item.fkey === this.selectedId) ? {'background-color': '#f2f2f2'} : ''), rColor]
  }

  async created() {
    if(!(Object.keys(this.$route.query).length === 0) && this.isExtended){
        this.baseTableState = false
    }
    this.perPage = JSON.parse(JSON.stringify(this.itemsPerPage))
    this.loading = true
    await this.preparedDataForTable()
  }

  openCard(isnew: boolean, index: number) {
    if (isnew) {
      this.cardStateAdd = !this.cardStateAdd
    } else {
      const result = this.localData.find((el) => el.fkey == index)
      this.cardData = Object.values(result)
      //console.log("this.cardData",this.cardData)
    }
    this.cardStateEdit = !this.cardStateEdit
  }

  openFinder() {
    this.searchState = !this.searchState
    this.search = ""
  }

  refreshEdit() {
    this.cardStateEdit = !this.cardStateEdit
    this.cardStateAdd = false;
  }

  refreshEditExtend() {
    this.baseTableState = true
  }

  deleteItemDialogOpen(index: number) {
    this.itemDeleteID = index
    this.itemDeleteDialog = !this.itemDeleteDialog
  }

  async deletItemForce(result: any = true) {
    if (result === true) {
      this.itemDeleteDialog = !this.itemDeleteDialog
      if (this.itemDeleteID > 0) {
        const fkey = this.localData.find((el) => el.fkey == this.itemDeleteID).fkey
        //console.log("Тут будет запрос на удаление записи по ключючу, что то типа этого: delete " + tableName + " where fkey = " + fkey)
        await baseController.applyTableChanges([{"tblName": this.tableDBName, "fkey": -fkey}])
        this.itemDeleteID = 0
        this.refreshData()
      }
    } else {
      this.itemDeleteID = 0
      this.itemDeleteDialog = !this.itemDeleteDialog
    }
  }

  cloneItemDialogOpen(index: number) {
    this.itemCloneID = index
    this.itemCloneDialog = !this.itemCloneDialog
  }

  async cloneItemForce(result: any = true) {
    if (result === true) {
        this.cardStateEdit = !this.cardStateEdit
        this.cardStateAdd = false;
        const result = this.localData.find((el) => el.fkey == this.itemCloneID)
        result.fkey = 0
        this.cardData = Object.values(result)
    } else {
      this.itemCloneID = 0
    }
    this.itemCloneDialog = !this.itemCloneDialog
  }

  rowClick(index: number): void {
    const result = this.localData.find((el) => el.fkey == index)
    this.selectedId = index
    this.$emit("navigateDeep", result)
  }

  dbClickEvent(item: any) {
    if (this.isExtended) {
      this.$router.push({name : "extendedCard", query : {stringId : item.fkey, reportId : "11", tableName : this.tableDBName}})
      this.baseTableState = false
    }
    const result = this.localData.find((el) => el.fkey == item.fkey)
    this.cardData = Object.values(result)
    this.$emit("dbClick", result)
  }

  goBackCard() {
    this.baseTableState = true
  }

  refreshData() {
    this.baseTableState = true
    this.$emit("needUpdateTable", this.selectedFilters)
  }

  clickMenu(item: any) {
    this.$emit(item.event)
  }

  calculatePagination() {
    let dataCount = this.tableData.length
    let pageNumbers = dataCount / this.perPage;
    this.pageNumbers = Math.ceil(pageNumbers)
  }

  nextSheet() {
    if (this.page+1 > this.pageNumbers) {
      return
    } else {
      this.page++
    }
  }

  prevSheet() {
    if (this.page == 1) {
      return
    } else {
      this.page--
    }
  }

  updateItems(data: any) {
    this.page = 1
    this.perPage = data
    this.calculatePagination()
  }

  async updateRequestCard(item: any) {
    this.$emit("updateParams", item)
  }

  rowClickFilter(index: number) {
    //проставление галок
    const result = this.localData.find((el) => el.fkey == index)
    const indexItem = this.inpVmodel.indexOf(result.fkey)
    if (indexItem != -1) {
      this.inpVmodel.splice(indexItem,1)
    } else {
      this.inpVmodel.push(result.fkey)
    }
  }

  openFilters() {
    this.filtersDialogState = !this.filtersDialogState
  }

  resetFilters() {
    //Удаляем все фильры
    if (this.selectedFilters) {
      this.selectedFilters = []
    }
    //Применяем
    this.applyFilters()
  }

  applyFilters() {
    this.filtersDialogState = false
    this.refreshData()
  }

}

</script>

<style >
.colClass {
  -webkit-transition: width 2s, height 2s, background-color 2s, -webkit-transform 2s;
  transition: width 2s, height 2s, background-color 2s, transform 2s;
}

.anyButtons{
  display: flex;
}

.v-data-table > .v-data-table__wrapper > table > tbody > tr > td,
.v-data-table > .v-data-table__wrapper > table > thead > tr > td,
.v-data-table > .v-data-table__wrapper > table > tfoot > tr > td {
  height: 26px;
}

.col {
  transition-duration: 1s
}

.controlIcons {
  white-space: nowrap;
}

.v-data-table-header th {
  white-space: nowrap;
}

/*
.v-data-table > .v-data-table__wrapper > table > tbody > tr > td,
.v-data-table > .v-data-table__wrapper > table > tbody > tr > th,
.v-data-table > .v-data-table__wrapper > table > thead > tr > td,
.v-data-table > .v-data-table__wrapper > table > thead > tr > th,
.v-data-table > .v-data-table__wrapper > table > tfoot > tr > td,
.v-data-table > .v-data-table__wrapper > table > tfoot > tr > th {
  padding: 0 5px;
}*/

</style>