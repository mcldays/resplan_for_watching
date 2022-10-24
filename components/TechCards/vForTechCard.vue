<!--Автор: Волков Максим-->
<!--Комментарий: попытка запихнуть comboBox в разметку v-for, пока в процессе, поскольку логику скрытия трудно реализовать-->
<template>
  <div>
    <!-- Основная страница ТехКарт -->
    <div class="techCard" v-if="!this.hideTechCards">
      <!-- Первая группа comboBox -->
      <div class="firstGroup">
        <v-stepper v-model="step"
                   class="stepperFilter"
                   :alt-labels="true"
                   :elevation="12"
                   :shaped="true">
          <v-stepper-header style="align-items:center">

              <div
                  v-for="(item,key) in fieldModel"
                  :key="item.f_spWorkLevels"
                  v-on:click="gotComboKey(key)"
              >

              <div v-if="key < 3" style="display:flex;text-align:center">
                <v-stepper-step
                    v-if="item.isSelected"
                    :step="key+1"
                    :complete="item.isSelected && step > 0"
                    complete-icon="mdi-check-outline"
                >
                <div class="stepper_label">
                  {{item.label}}
                </div>
                </v-stepper-step>
                <div>
                  <ComboPicker
                      style="margin-left:10px"
                      :is-show="item.isSelected"
                      :label-name="item.label.split('Выберите ')[1]"
                      :my-combo-items="item.comboList"
                      @valueChanged="comboValueChanged"
                      :table-name="item.tableName"
                  />
                </div>
                <v-divider v-if="item.comboList.length && item.isSelected && key < 2"
                           style="margin:1px;height:115px"
                           vertical
                           color="#1976d2"
                >
                </v-divider>
              </div>
            </div>
          </v-stepper-header>
        </v-stepper>
      </div>

      <v-container align-center
                   justify-center
                   row>
        <!-- Вторая группа comboBox -->
        <div class="secondGroup" style="display:flex" v-if="fieldModel[1].isSelected && fieldModel[2].isSelected && fieldModel[3].isSelected && fieldModel[3].comboList.length">
          <v-stepper  v-model="step"
                      class="stepperFilter"
                      :alt-labels="true"
                      :elevation="6"
                      :shaped="true"
          >
            <v-stepper-header style="align-items:center">
              <v-stepper-step
                  step="4"
                  :complete="fieldModel[1].isSelected && fieldModel[2].isSelected && fieldModel[3].isSelected && step > 3"
                  complete-icon="mdi-check-outline"
              >
                <div class="stepper_label">
                  Выберите доп параметры:
                </div>
              </v-stepper-step>

              <div
                  v-for="(elem,key) in fieldModel"
                  :key="elem.f_spWorkLevels"
                  v-on:click="gotComboKey(key)"
              >

                <div v-if="key > 2 && elem.comboList.length" style="display:flex;text-align:center">
                  <div>
                    <ComboPicker
                        style="margin-left:10px"
                        :is-show="elem.isSelected"
                        :label-name="elem.label"
                        :my-combo-items="elem.comboList"
                        @valueChanged="comboValueChanged"
                        :table-name="elem.tableName"
                    />
                  </div>
                  <v-divider v-if="elem.comboList.length && elem.isSelected && key < 6"
                             style="margin:1px;height:115px"
                             vertical
                             color="#1976d2"
                  >
                  </v-divider>
                </div>
              </div>

            </v-stepper-header>
          </v-stepper>
        </div>
      </v-container>

      <!-- Таблица основных редакций ТехКарт -->
      <div>
        <v-slide-y-reverse-transition>
          <BaseTable
              :table-data="this.dataTable"
              :headers="this.headers"
              :table-name="tableName"
              :toolbar-vision="true"
              @navigateDeep="rowClicked"
              @dbClick="dblClicked"
              :control-button-vision="true"
              style="margin:10px"
          />
        </v-slide-y-reverse-transition>
      </div>
      <!-- Таблица альтернативных редакций ТехКарт -->
      <div v-if="isFirstSelected && isSecondSelected && isThirdSelected">
        <v-fade-transition>
          <BaseTable
              v-if="cascadeTableState"
              :tableName="childTableName"
              :table-data="this.cascadeDataTable"
              :headers="this.cascadeHeaders"
              style="margin:10px"
          />
        </v-fade-transition>
      </div>
    </div>
    <!-- Новая страница -->
    <div class="another" v-if="this.hideTechCards">
      <!-- Хлебные крошки -->
      <v-container
          align-center
          justify-left
          row>
        <v-btn
            depressed
            icon
            color="primary"
            @click="goBack"
            :x-large="true"
        >
          <v-icon>
            mdi-arrow-left-thick
          </v-icon>

        </v-btn>
        <v-breadcrumbs
            :items="this.breadCrumbsItems"
            large>
          <template v-slot:divider>
            <v-icon>mdi-menu-right-outline</v-icon>
          </template>
        </v-breadcrumbs>
      </v-container>

      <!-- Карточка с инфо и редактируемыми полями -->
      <v-card style="margin:5px">
        <v-card-text>
          <v-container
              align-center
              justify-left
              row>
            <div class="highlightedInfo">
              Объект:
            </div>
            <div class="infoFields">
              {{this.objName}}
            </div>

            <v-divider class="cardDivider" vertical color="#1976d2"> </v-divider>

            <div class="highlightedInfo">
              Редакция:
            </div>
            <div class="infoFields">
              {{this.number}}. {{this.type}}
            </div>

            <v-divider class="cardDivider" vertical color="#1976d2"> </v-divider>

            <div class="highlightedInfo">
              Автор:
            </div>
            <div class="infoFields">
              {{this.authName}}
            </div>

            <v-divider class="cardDivider" vertical color="#1976d2"> </v-divider>
            <div class="highlightedInfo">
              Дата создания:
            </div>
            <div class="infoFields">
              {{this.beginDate}}
            </div>
          </v-container>
          <v-divider class="my-2" color="#1976d2" horizontal> </v-divider>
          <v-container
              align-center
              justify-left
              row>
            <v-row>
              <v-col v-for="(field, key) in rowData"
                     :key="key"
              >
                <v-text-field
                    class="pa-5"
                    hide-details
                    :label="field.key.text"
                    v-model="field.value"
                    :disabled="false">
                </v-text-field>
              </v-col>
            </v-row>
            <v-btn
                center
                icon
                depressed
                color="primary"
                @click="saveRowData"
            >
              <v-icon>
                mdi mdi-content-save
              </v-icon>

            </v-btn>
            <v-alert v-show="this.notify"
                     type="success"
                     border="left"
                     color="green"
                     style="width:30%;"
            >
              Успешно ничего не произошло!
            </v-alert>
          </v-container>
        </v-card-text>
      </v-card>
      <!-- bottomArea -->
      <div style="display:flex">
        <div class="leftArea">
          <v-slide-y-transition>
            <!-- treeView списка операций -->
            <TreeView v-if="keyForTreeView"
                      :clickedKey ="keyForTreeView"
                      @selectedItem="currSelectedTreeViewItem">
            </TreeView>>
          </v-slide-y-transition>
        </div>

        <!-- таблица расходов-->
        <div class="rightArea" v-if="costsTableState">
          <v-slide-x-transition>
            <!-- todo 3 Высота таблицы не контролируется, ширина контроллится, но при этом высота игнорируется даже внешней оберткой любого элемента -->
            <BaseTable
                tableName="Состав расходов на операцию"
                :table-data="this.costsDataTable"
                :headers="this.costsHeaders"
                :toolbar-vision="true"
                :control-button-vision="false"
            />
          </v-slide-x-transition>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
// импорты библиотек и компонентов
import {Component, Watch} from 'vue-property-decorator'
import BaseTable from "@/ui/BaseTable.vue";
import {Header} from "@/models/TableDataModel";
import {mixins} from "vue-class-component";
import {tableMixin} from "@/mixins/tableMixin";
import LeftMenu from "@/ui/LeftMenu.vue"
import SelectTable from "@/ui/SelectTable.vue";
import EditCard from "@/ui/EditCard.vue";
import ComboPicker from "@/ui/ComboPicker.vue";
import ActionBar from "@/ui/ActionBar.vue";
import TreeView from "@/ui/TreeView.vue";
import {techCardsController} from "@/controllers/techCardsController";

// регистрация компонентов
@Component({
  components: {BaseTable, LeftMenu, SelectTable, EditCard, ComboPicker, ActionBar, TreeView}
})

// описание класса компонента TechCardsMain
export default class vForTechCard extends mixins(tableMixin) {
  // значение для фильтра comboBox "Объект"
  private objFilter = 0

  // переменная для состояния фильтра "Виды деятльности"
  private isFirstSelected = false
  // переменная для состояния фильтра "Направление"
  private isSecondSelected = false
  // переменная для состояния фильтра "Тип работ"
  private isThirdSelected = false
  // переменная для состояния фильтра "Вид работ"
  private isForthSelected = false
  // переменная для состояния фильтра "Этап"
  private isFifthSelected = false
  // переменная для состояния фильтра "Операция"
  private isSixthSelected = false

  // переменная состояния выбора всех базовых фильтров(первые три)
  private isAllSelected = false

  // заголовок основной таблицы
  private tableName = "Тех. Карты"
  // заголовок дочерней таблицы
  private childTableName = "Альтернативные Тех.Карты"
  // данные для таблицы осн. редакций ТехКарт
  private dataTable: any[] = []
  // заголовки для таблицы осн. редакций ТехКарт
  private headers: Header[] = []

  // переменная для отрисовки дочерней таблицы (альт. редакций ТехКарт)
  private cascadeTableState  = false
  // данные для таблицы альт. редакций ТехКарт
  private cascadeDataTable : any[] = []
  // заголовки для таблицы альт. редакций ТехКарт
  private cascadeHeaders : Header[] = []

  // переменная для управления разметкой
  private hideTechCards = false
  // список заголовков техКарты, исключаемых для отображения в карточке
  private excludedHeaders = ["spObjectsName","wFormsName","wDirectionsName","wTypesName","wWorksName",
    "fAutor","fDateCreate","fNum","fkey"]
  // редактируемые поля для ТехКарты
  private rowData: any[] = []
  // данные кликнутой строки в таблице
  private fullRowData: any[] = []
  // заголовки для редатируемых полей в карточке
  private newHeaders: Header[] = []
  // ключи для редатируемых полей в карточке
  private newKeys: number[] = []
  // коллекция для хлебных крошек
  private breadCrumbsItems:Array<any> = []

  // данные для таблицы операций редакций ТехКарт
  private operationsDataTable : any[] = []
  // заголовки для таблицы операций альт. редакций ТехКарт
  private operationsHeaders : Header[] = []
  // для уведомлений
  private notify = false

  // подписи текстовых полей детализации ТехКарты
  private objName = ""
  private authName = ""
  private beginDate = ""
  private number = ""
  private type = ""

  // ключ кликнутой записи для treeView
  private keyForTreeView = 0

  // переменная для отрисовки дочерней таблицы (список расходов)
  private costsTableState  = false
  // данные для таблицы Расходов
  private costsDataTable : any[] = []
  // заголовки для таблицы Расходов
  private costsHeaders : Header[] = []
  // шаг для степпера фильтров
  private step = 0

  private currKey:number

  // массив данных для фильтров
  private fieldModel:{  name:string,
                        label:string,
                        tableName:string,
                        f_spWorkLevels:number,
                        comboList: any[],
                        allData: any[],
                        filter:number,
                        isSelected:boolean}[] = [
    {name: "forms",label: "Выберите Вид Деятельности",tableName:"wforms",f_spWorkLevels: 1, comboList: [], allData: [], filter: 0, isSelected:true},
    {name: "directions", label: "Выберите Направление", tableName:"wDirections",f_spWorkLevels: 2, comboList: [], allData: [], filter: 0, isSelected:false},
    {name: "workTypes", label: "Выберите Вид Работ", tableName:"wWorks",f_spWorkLevels: 3,comboList: [], allData: [], filter: 0, isSelected:false},
    {name: "works", label: "Тип Работ",f_spWorkLevels: 4, tableName:"wTypes",comboList: [], allData: [], filter: 0, isSelected:false},
    {name: "stages", label: "Этап",f_spWorkLevels: 5, tableName:"wTypes",comboList: [], allData: [], filter: 0, isSelected:false},
    {name: "techOps",label: "Операция",f_spWorkLevels: 6, tableName:"wTypes",comboList: [], allData: [], filter: 0, isSelected:false},
  ]

  // крюк на создание: подготовка данных для отображения
  async created() :Promise<void>{
    // подготовка данных для таблицы
    await this.prepareAllFilterFieldsData()
    await this.prepareDataForTable()
  }

  // индекс редактируемого comboBox
  gotComboKey(key:number):void{
    console.log("keyF",key)
    this.currKey = key
  }

  // получаем запросами все данные для comboBox
  prepareAllFilterFieldsData():void{
    this.fieldModel.forEach(async (elem,index) =>{
      let comboData = await techCardsController.getWorks(elem.f_spWorkLevels);
      elem.allData = this.preparedDataToTable(comboData).valuesTable;
      (index===0)? elem.comboList = elem.allData:undefined
    });
    //console.log("fieldModel",this.fieldModel)
  }

  // формируем строку с фильтрами для запроса
  conCatMeow():string{
    let queryFilter = ""
    this.fieldModel.forEach((elem) =>{
      queryFilter === "" ? queryFilter = elem.filter.toString(): queryFilter = queryFilter +","+ elem.filter.toString()
    });
    console.log("queryFilter",queryFilter)
    return queryFilter
  }
  // подготовка данных для таблицы (f_spTC = - 1 выводит только основные редакции)
  async prepareDataForTable() :Promise<void>{
    let dataTable = await techCardsController.getTC(0,0,-1,this.conCatMeow())
    let result = this.preparedDataToTable(dataTable)

    if (!result.valuesTable.length){
      this.dataTable =[];
      this.headers =[];
    }
    else{
      this.dataTable = result.valuesTable
      this.headers = result.headersTable
    }
  }

  // событие изменение значения comboBox "Виды Деятельности"
  async comboValueChanged(value: any) :Promise<void>{
    this.step = this.currKey+1
    this.fieldModel[this.currKey].filter = this.getFilter(value);

    // фильтруем
    this.fieldModel[this.currKey+1].comboList = await this.filteredItemsForNext(this.fieldModel[this.currKey+1].allData, this.currKey);
    console.log("c",this.fieldModel[this.currKey+1].comboList)
    // выставляем состояние выбора
    this.fieldModel[this.currKey+1].isSelected = this.changeComboState(value, this.step)
    console.log("state",this.fieldModel[this.currKey].isSelected )

    // логика для степпера и скрытия
    this.updateStatesAndFilters(value, this.currKey+1)

    //console.log("fieldModel2",this.fieldModel)
    // обновление табличной модели
    await this.refresh()
  }

  // обновить состояния и фильтры
  updateStatesAndFilters(value:any, step:number) : void{
    if (value === null){
      // корректировка шага
      if (!this.fieldModel[step].isSelected && step===this.step){
        step = step - 1
      }
      this.currKey===0? step = 1: undefined;
      // обнуляем фильтры
      for (let i = step; i < this.fieldModel.length; i++){
        this.fieldModel[i].filter = 0
        this.fieldModel[i].isSelected = false
      }
    }
    else{
      // передаем шаг для stepper
      this.step = step
    }
  }
  // фильтруем данные для следующего списка
  async filteredItemsForNext(filderData: any[],i: number): Promise<any>{
    return filderData.filter(item => item.f_spWorks === this.fieldModel[i].filter)
  }

  // скрываем или отображаем следующий comboBox
  changeComboState(value: any, step:number) : boolean{
    return (value !== null)
    // else{
    //   let state = true
    //   for (let i = step+1; i < this.fieldModel.length; i++){
    //     state =  state && this.fieldModel[i].isSelected
    //   }
    //   console.log("state1",state)
    //   return state
    //}

  }
  // получаем значение для фильтра
  getFilter(value: any) :number{
    let filter = 0
    if (value != undefined){
      filter = value.fkey
    }
    return filter
  }
  // обновление таблицы с применением фильтров
  refresh() : void{
    this.prepareDataForTable()
  }

  // условие отрисовки таблицы ТехКарт
  @Watch("isAllSelected", {deep: true})
  showTable():void{
    if (this.isAllSelected){
      this.prepareDataForTable()
    }
    else{
      this.dataTable = []
    }
  }


  // события клика на строку
  async rowClicked(item : any) :Promise<void>{

    console.log("TechCardData",item)
    // отрисовка дочерней таблицы (альт. редакции ТехКарт)
    let result = await techCardsController.getTC(0,0,item.fkey,this.conCatMeow())
    let parsed = this.preparedDataToTable(result)
    this.cascadeDataTable = parsed.valuesTable
    this.cascadeHeaders = parsed.headersTable
    this.cascadeTableState = true
  }
  // события даблКлика на строку
  async dblClicked(item: any) :Promise<void>{
    this.fullRowData = item
    // действия на dblClick() - выбор редакции ТехКарты
    console.log("dblClicked", item)
    // скрываем основную страницу и отображаем разметку для выбранной редакции
    this.hideTechCards = true

    // передаем данные для хлебных крошек
    this.breadCrumbsItems =  [{text:item.wFormsName},
      {text:item.wDirectionsName},
      {text:item.wTypesName},
      {text:item.wWorksName}]

    // передаем данные для инфо
    this.objName = item.spObjectTypesName
    this.authName = item.fAutor
    this.beginDate = item.fDateCreate
    this.number = item.fNum

    if (item.f_SPTC === -1){
      this.type = "Основная"
    }
    else{
      this.type ="Альтернативная"
    }

    // формируем список заголовков и значений для страницы ТехКарты
    this.headers.forEach((elem,index) =>{
      if (!this.isExcluded(elem.value)){
        this.newHeaders.push(elem)
        this.newKeys.push(JSON.parse(JSON.stringify(Object.values(item)[index])))
      }
    });

    // передаем данные для отображения
    this.rowData = this.convertToKeyValuePair(JSON.parse(JSON.stringify(this.newHeaders)), Object.values(this.newKeys))
    console.log("rowData", this.rowData)

    // таблица операций
    this.keyForTreeView =item.fkey
  }
  // возврат на главную страницу
  goBack() :void{
    this.hideTechCards = false
    this.prepareAllFilterFieldsData()
  }

  // сохранить отредактированную редакцию ТехКарты
  saveRowData() :void{
    alert("Подтвердить изменения?")
    this.notify=true
    setTimeout(() => {
      this.notify = false
    }, 2000);
  }

  // проверяем входит ли текущий заголовок в список исключений
  isExcluded(elem: string) :boolean{
    let isExists = false
    this.excludedHeaders.forEach((field)=> {
      if (field === elem || elem.includes('f_')){
        isExists = true
      }
    });
    return isExists
  }
  // обнуляем переменные при вовзрате на главную страницу ТехКарт
  @Watch("hideTechCards", {deep: true})
  pageStateChanged() :void{
    if (!this.hideTechCards)
    {
      this.step = 0
      this.objName = ""
      this.authName = ""
      this.beginDate = ""
      this.number = ""
      this.type = ""

      this.dataTable = []
      this.headers = []
      this.newHeaders = []
      this.newKeys = []
      this.operationsHeaders = []
      this.operationsDataTable = []
      this.costsHeaders = []
      this.costsDataTable = []

      this.isThirdSelected = false
      this.isAllSelected = false
      this.isFirstSelected = false
      this.isSecondSelected = false
      this.isFifthSelected = false
      this.isSixthSelected = false
      this.keyForTreeView = 0
      this.costsTableState = false
      this.cascadeTableState = false
    }
  }

  // выдаем варнинг
  @Watch("dataTable", {deep: true})
  tableDataChanged():void{
    setTimeout(() => {
      if (this.dataTable.length === 0) {
        alert("Данные не найдены, они в другом замке!")
      }
    }, 500);
  }
  // событие выбора позиции в treeView
  currSelectedTreeViewItem(item:any) : void {
    // подготовка данных
    this.prepareDataForCostsTable(item)
  }

  // подготовка данных для дочерней таблицы (список Затрат)
  async prepareDataForCostsTable(item:any) : Promise<void> {
    if (item.children === undefined){
      let result = await techCardsController.getTC_Spends(0,item.id)
      let parsed = this.preparedDataToTable(result)

      this.costsDataTable = parsed.valuesTable
      this.costsHeaders = parsed.headersTable
      this.costsDataTable.length ? this.costsTableState = true : this.costsTableState = false
    }
    else{
      this.costsDataTable = []
      this.costsHeaders = []
      this.costsTableState = false
    }
  }

}
</script>

<style scoped>
.firstGroup{
  display:flex;
  margin-bottom:10px;
  margin-left:40px
}
.secondGroup{
  display:flex;
  margin-left:15px
}

.infoFields{
  margin-left:0;
  margin-right:5px;
  font-size:18px;
  color:black;
  text-align: left;
}
.highlightedInfo{
  margin:5px;
  font-size:18px;
  color:black;
  font-weight:bold
}
.leftArea,.rightArea{
  width:50%;
  margin:5px
}
.stepper_label{
  text-align: -webkit-center;
}
.stepperFilter{
  margin-left:10px;
  margin-right:10px;
  margin-bottom:5px;
  height:115px
}
.cardDivider{
  margin:1px;
  height:40px
}
.comboDivider{
  margin:10px;
  height:115px
}
/*::v-deep .v-data-table__wrapper{*/
/*  height:350px*/
/*}*/

</style>