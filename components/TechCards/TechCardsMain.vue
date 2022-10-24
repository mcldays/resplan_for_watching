<!--Автор: Волков Максим-->
<template>
  <div>
    <!-- Основная страница ТехКарт -->
    <div class="techCard" v-if="!this.hideTechCards">
      <!--<v-btn
          depressed
          icon
          color="#1976d2"
          @click="showInfo"
          :x-large="true"
      >
        <v-icon>
          mdi-information
        </v-icon>
        Инфо
      </v-btn>-->
      <!-- Первая группа comboBox -->
      <div class="firstGroup">
        <v-stepper v-model="step"
            class="stepperFilter"
            :alt-labels="true"
            :elevation="12"
            :shaped="true">
          <v-stepper-header>
            <v-stepper-step
                step="1"
                :complete="isFirstSelected && step > 0"
                complete-icon="mdi-check-outline"
            >
              <div class="stepper_label">
                  Выберите вид деятельности:
              </div>
            </v-stepper-step>
            <div>
              <ComboPicker
                  style="margin:10px"
                  label-name="Виды Деятельности"
                  :my-combo-items="fieldModel[0].allData"
                  :my-headers="fieldModel[0].myHeader"
                  @valueChanged="valueChangedForms"
              />
            </div>
            <v-divider v-if="isFirstSelected && fieldModel[1].comboList.length"
                       style="margin:1px;height:115px"
                       vertical
                       color="#1976d2"
            >
            </v-divider>

              <v-stepper-step v-if="isFirstSelected && fieldModel[1].comboList.length"
                              step="2"
                              complete-icon="mdi-check-outline"
                              :complete="isSecondSelected && step > 1"
              >
                <div class="stepper_label">
                    Выберите направление:
                </div>
              </v-stepper-step>
            <div>
              <ComboPicker
                  style="margin:10px"
                  label-name="Направление"
                  :is-show="isFirstSelected && fieldModel[1].comboList.length"
                  :my-combo-items="fieldModel[1].comboList"
                  :my-headers="fieldModel[1].myHeader"
                  @valueChanged="valueChangedDirections"
              />
            </div>

            <v-divider v-if="isFirstSelected && isSecondSelected && fieldModel[2].comboList.length"
                       style="margin:1px;height:115px"
                       vertical
                       color="#1976d2"
            >
            </v-divider>

            <v-stepper-step v-if="isFirstSelected && isSecondSelected && fieldModel[2].comboList.length"
                            step="3"
                            complete-icon="mdi-check-outline"
                            :complete="isThirdSelected && step > 2"
            >
              <div class="stepper_label">
                  Выберите тип работ:
              </div>
            </v-stepper-step>
            <div>
              <ComboPicker
                  style="margin:10px"
                  label-name="Тип работ"
                  :is-show="isSecondSelected && isFirstSelected && fieldModel[1].comboList.length"
                  :my-combo-items="fieldModel[2].comboList"
                  :my-headers="fieldModel[2].myHeader"
                  @valueChanged="valueChangedWorkTypes"
              />
            </div>
          </v-stepper-header>
        </v-stepper>
      </div>
      <v-container align-center
                   justify-center
                   row>
      <!-- Вторая группа comboBox -->
        <div class="secondGroup" style="display:flex" v-if="isThirdSelected && isSecondSelected && isFirstSelected">
          <v-stepper  v-model="step"
                      class="stepperFilter"
                      :alt-labels="true"
                      :elevation="6"
                      :shaped="true"
                      >
            <v-stepper-header>
              <v-stepper-step
                  step="4"
                  :complete="isThirdSelected && isSecondSelected && isFirstSelected && step > 3"
                  complete-icon="mdi-check-outline"
              >
                <div class="stepper_label">
                  Выберите доп параметры:
                </div>
              </v-stepper-step>
          <div>
            <ComboPicker
                style="margin:10px"
                label-name="Вид работ"
                :is-show="isThirdSelected && isSecondSelected && isFirstSelected && fieldModel[3].comboList.length"
                :my-combo-items="fieldModel[3].comboList"
                :my-headers="fieldModel[3].myHeader"
                @valueChanged="valueChangedWork"
            />
          </div>
          <v-divider v-if="isFirstSelected && isSecondSelected && isThirdSelected && isForthSelected && fieldModel[4].comboList.length"
                     style="margin:1px;height:115px"
                     vertical
                     color="#1976d2"
          >
          </v-divider>
          <div>
            <ComboPicker
                style="margin:10px"
                label-name="Этап"
                :is-show="isThirdSelected && isSecondSelected && isFirstSelected && isForthSelected && fieldModel[4].comboList.length"
                :my-combo-items="fieldModel[4].comboList"
                :my-headers="fieldModel[4].myHeader"
                @valueChanged="valueChangedStages"
            />
          </div>
          <v-divider v-if="isFirstSelected && isSecondSelected && isThirdSelected && isForthSelected && isFifthSelected && fieldModel[5].comboList.length"
                     style="margin:1px;height:115px"
                     vertical
                     color="#1976d2"
          >
          </v-divider>
          <div>
            <ComboPicker
                style="margin:10px"
                label-name="Операция"
                :my-combo-items="fieldModel[5].comboList"
                :my-headers="fieldModel[5].myHeader"
                :is-show="isFirstSelected && isSecondSelected && isThirdSelected && isForthSelected && isFifthSelected && fieldModel[5].comboList.length"
                @valueChanged="valueChangedTechOps"
            />
          </div>
            </v-stepper-header>
          </v-stepper>
        </div>
      </v-container>

      <!-- Таблица основных редакций ТехКарт -->
      <div v-if="isFirstSelected">
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
      <div v-if="isFirstSelected">
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

      <div class="testTree">
        <v-dialog
            transition="dialog-bottom-transition"
            v-model="workSpDialog"
            width="90%">
          <v-slide-y-transition>
            <div style="background-color:darkgoldenrod">
              <v-btn
                  color="blue"
                  text
                  @click="workSpDialog=false"
                  icon
              >
                <v-icon
                    style="size:8px"
                    color="black">
                  mdi-close-circle
                </v-icon>
              </v-btn>
              <!-- treeView списка операций -->
              <TreeView
                  v-if="myTest.length"
                  my-title="Справочник работ"
                  :my-items="this.myTest"
                  :disable-moving="true"
                  :expand-all="false"
                  :dynamic-loading="true"
                  tree-height="max-content"
              >
              </TreeView>
            </div>
          </v-slide-y-transition>
        </v-dialog>
      </div>
    </div>

    <!-- Новая страница -->
    <div class="another" v-if="this.hideTechCards">
      <!-- Хлебные крошки -->
      <v-container
          align-center
          justify-left
          row>
        <div style="display:flex">
          <v-btn
              depressed
              icon
              color="#1976d2"
              @click="goBack"
              :x-large="true"
          >
            <v-icon>
              mdi-arrow-left-thick
            </v-icon>

          </v-btn>
          <v-breadcrumbs
              class="bread"
              :items="this.breadCrumbsItems"
          >
            <template v-slot:item="{item}">
              <div style="color:#1976d2;font-size:14px">{{ item.text }}</div>
            </template>

            <template v-slot:divider>
              <v-icon color="#1976d2">mdi-menu-right-outline</v-icon>
            </template>
          </v-breadcrumbs>
          </div>
      </v-container>

      <!-- Карточка с инфо и редактируемыми полями -->
      <v-card style="margin:5px">
        <v-card-text>
          <v-container
              align-center
              justify-left
              row>

            <BaseTable
                :table-data="[fullRowData]"
                :headers="headers"
                :toolbar-vision="true"
                :control-button-vision="false"
            />

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
      <div class="bottomArea" style="display:flex">
        <div class="leftArea">
          <v-slide-y-transition>
          <!-- treeView списка операций -->
            <TreeView v-if="keyForTreeView"
                      :clickedKey ="keyForTreeView"
                      my-title="Состав операций ТехКарты"
                      @selectedItem="currSelectedTreeViewItem"
                      :disableMoving="false"
                      >
            </TreeView>
        </v-slide-y-transition>
        </div>

        <!-- таблица расходов-->
        <v-slide-x-transition>
          <div class="rightArea" v-if="costsTableState">
            <v-card style="background-color:lightgray">
              <v-card-title style="color:black;padding:4px;margin-left:20px"> Состав расходов на Операцию
                <v-divider
                           style="margin-left:5px"
                           vertical
                           color="#1976d2"
                >
                </v-divider>
                <v-btn
                    icon
                    depressed
                    style="margin-left:0"
                    hint="добавить вариант">
                  <v-icon
                      style="size:8px"
                      color="#1976d2">
                    mdi-pen-plus
                  </v-icon>
                </v-btn>

                <v-spacer> </v-spacer>
                  <h5 v-if="isMultiple" style="color:green">Режим мультивыбора</h5>

                  <v-btn @click="expandAll"
                         icon
                         depressed
                         style="margin-left:0">
                    <v-icon
                        style="size:8px"
                        color="#1976d2">
                      mdi-expand-all
                    </v-icon>
                  </v-btn>

                  <v-btn @click="closeAll"
                         icon
                         depressed
                         style="margin-left:0">
                    <v-icon
                        style="size:8px"
                        color="#1976d2">
                      mdi-collapse-all
                    </v-icon>
                  </v-btn>

              </v-card-title>
                <v-slide-x-transition>
<!--                  <v-skeleton-loader-->
<!--                      type="list-item,table-tbody"-->
<!--                      v-if="skeleton"-->
<!--                  />-->
                  <div>
                    <v-expansion-panels
                        v-if="costsTableState"
                        v-model="states"
                        :focusable="true"
                        :multiple="isMultiple"
                        :inset="true"
                    >
                      <v-expansion-panel
                          v-for="(panel,i) in expArr"
                          :key="i"
                          v-model="states"
                      >
                        <v-expansion-panel-header
                            class="expPanel"
                            expand-icon="mdi-arrow-down-bold-hexagon-outline"
                        >
                          <v-container
                              align-center
                              justify-left
                              row
                          >
                            <div :style="[(panel.isMain) ? {'color':'#1976d2'} : {'color':'grey'}]">
                              Вариант {{panel.variant.fVariant}}
                            </div>

                            <v-spacer> </v-spacer>

                            <div :style="[(panel.isMain) ? {'color':'#1976d2'} : {'color':'grey'}]">
                              Основной
                            </div>
                            <v-checkbox
                                style="margin-top:16px;"
                                :dense="true"
                                v-model="panel.isMain"
                                @click="varClicked(panel)">
                            </v-checkbox>
                          </v-container>
                        </v-expansion-panel-header>

                          <v-expansion-panel-content>
                            <BaseTable
                                :table-data="panel.data"
                                :headers="costsHeaders"
                                :toolbar-vision="true"
                                :control-button-vision="false"
                            />
                          </v-expansion-panel-content>
                      </v-expansion-panel>
                    </v-expansion-panels>
                  </div>
                </v-slide-x-transition>
            </v-card>
          </div>
        </v-slide-x-transition>
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
import {ComboDataModel} from "@/models/ComboDataModel";
import {TreeChild,TreeParent,TreeViewDataModel} from "@/models/TreeViewDataModel";
import {baseController} from "@/controllers/baseController";
// регистрация компонентов
@Component({
  components: {BaseTable, LeftMenu, SelectTable, EditCard, ComboPicker, ActionBar, TreeView}
})

// описание класса компонента TechCardsMain
export default class TechCardsMain extends mixins(tableMixin) {
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
  // диалог справочника
  private workSpDialog = false
  // последняя дата
  private prevData : any[] = []

  private defaultValues: any = []

  // массив данных нескольких comboBox для фильтров
  private fieldModel: ComboDataModel[] = [
    {name: "forms", level: 1, comboList: [], allData: [] , filter: 0, myHeader:[]},
    {name: "directions", level: 2, comboList: [], allData: [], filter: 0, myHeader:[]},
    {name: "workTypes", level: 3,comboList: [], allData: [], filter: 0, myHeader:[]},
    {name: "works",level: 4, comboList: [], allData: [], filter: 0, myHeader:[]},
    {name: "stages", level: 5,comboList: [], allData: [], filter: 0, myHeader:[]},
    {name: "techOps",level: 6, comboList: [], allData: [], filter: 0, myHeader:[]},
  ]

  // тестовые данные для многоуровневого treeView
  private myTest: { id: number, name: string, key:number, number:string ,children?: TreeChild[] }[] = []

  // массив данных для expansionPanels
  private expArr: any = []
  // состояния v-expansionPanels
  private states: any
  // множественное раскрытие панелей
  private isMultiple = false
  // skeleton загрузка
  //private skeleton = false
  // крюк на создание: подготовка данных для отображения
  async created() :Promise<void>{
    // подготовка данных для таблицы
    await this.prepareAllFilterFieldsData()
    await this.prepareTestData()
  }

  // справочник работ
  showInfo():void{
    this.workSpDialog = true
  }
  // тестовые данные для TreeView
  async prepareTestData():Promise<void>{
    // получаем список родителей самого верхнего узла
    let response = await techCardsController.getWorks(1,0)
    let result = this.preparedDataToTable(response)

    let some: TreeParent[] = []

    // переформируем под класс TreeViewDataModel
    result.valuesTable.forEach((elem,index) => {
      some.push({
        id: elem.fkey,
        name: elem.fCode + " " + elem.fName,
        key: elem.fkey,
        number: index.toString(),
        children: elem.Child === "1"? [] : undefined
      });
    });

    this.myTest = some
  }

  // получаем запросами все данные для comboBox
  prepareAllFilterFieldsData():void{
    this.fieldModel.forEach(async (elem,index) =>{
      let response= await techCardsController.getWorks(elem.level,0);
      let comboData = this.preparedDataToTable(response);
      elem.allData = comboData.valuesTable;
      elem.myHeader = comboData.headersTable;
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
  async valueChangedForms(value: any) :Promise<void>{
    // получаем значение фильтра
    this.fieldModel[0].filter = this.getFilter(value);
    // фильтруем
    this.fieldModel[1].comboList = await this.filteredItemsForNext(this.fieldModel[1].allData,0);
    // выставляем состояние выбора
    this.isFirstSelected = this.changeComboState(value)
    // логика для степпера и скрытия
    this.updateStatesAndFilters(value,1)
    // this.updateRoute(value)
    this.refresh()
  }
  // событие изменение значения comboBox "Направление"
  async valueChangedDirections(value: any) :Promise<void>{
    this.fieldModel[1].filter = this.getFilter(value)

    this.fieldModel[2].comboList = await this.filteredItemsForNext(this.fieldModel[2].allData,1);
    this.isSecondSelected = this.changeComboState(value)

    this.updateStatesAndFilters(value,2)
    this.refresh()
  }
  // событие изменение значения comboBox "Тип работ"
  async valueChangedWorkTypes(value: any) :Promise<void>{
    this.fieldModel[2].filter = this.getFilter(value)

    this.isThirdSelected = this.changeComboState(value);
    this.fieldModel[3].comboList = await this.filteredItemsForNext(this.fieldModel[3].allData,2);

    this.updateStatesAndFilters(value,3)
    // проверяем, все ли фильтры выбраны
    this.isAllSelected = this.isFirstSelected && this.isThirdSelected && this.isSecondSelected

    this.refresh()
  }
  // событие изменение значения comboBox "Вид работ"
  async valueChangedWork(value: any) :Promise<void>{
    this.fieldModel[3].filter = this.getFilter(value)

    this.fieldModel[4].comboList = await this.filteredItemsForNext(this.fieldModel[4].allData,3);
    this.isForthSelected = this.changeComboState(value)

    this.updateStatesAndFilters(value,4)

    await this.refresh()
  }
  // событие изменение значения comboBox "Этап"
  async valueChangedStages(value: any) :Promise<void>{
    this.fieldModel[4].filter = this.getFilter(value)

    this.fieldModel[5].comboList = await this.filteredItemsForNext(this.fieldModel[5].allData,4);
    this.isFifthSelected = this.changeComboState(value )

    this.updateStatesAndFilters(value,5)

    await this.refresh()
  }
  // событие изменение значения comboBox "Операция"
  async valueChangedTechOps(value: any) :Promise<void>{
    this.fieldModel[5].filter = this.getFilter(value)

    this.isSixthSelected = this.changeComboState(value )
    this.updateStatesAndFilters(value,6)

    await this.refresh()
  }


  // updateRoute(value:any):void{
  //   console.log("val",value)
  //   // value !== null? this.$router.push({ name: 'tech', params: { form: 'form=' + value.fkey.toString() } })
  //   //           : this.$router.replace({ path: '/techcard' })
  // }
  // обновить состояния и фильтры
  updateStatesAndFilters(value:any, step:number) : void{
    if (value === null){
      // переключаем состояния
      if (step < 3){
        this.isSecondSelected = false;
        this.isThirdSelected = false;
        this.isForthSelected = false;
        this.isFifthSelected = false;
        this.isSixthSelected = false;
      }
      if (step > 3){
        this.isFifthSelected = false;
        this.isSixthSelected = false;
      }
      // обнуляем фильтры
      for (let i = step; i < this.fieldModel.length; i++){
        this.fieldModel[i].filter = 0
      }
      // let arr = [this.isFirstSelected,this.isSecondSelected,this.isThirdSelected,this.isForthSelected,this.isFifthSelected,this.isSixthSelected]
      // console.log("states", arr)
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
  changeComboState(value: any) : boolean{
    return (value !== null)
  }
  // получаем значение для фильтра
  getFilter(value: any) :number{
    let filter = 0
    if (value !== undefined && value !== null){
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

    // отрисовка дочерней таблицы (альт. редакции ТехКарт)
    let result = await techCardsController.getTC(0,0,item.fkey,this.conCatMeow())
    let parsed = this.preparedDataToTable(result)
    this.cascadeDataTable = parsed.valuesTable
    this.cascadeHeaders = parsed.headersTable
    this.cascadeTableState = true
  }
  // события даблКлика на строку
  async dblClicked(item: any) :Promise<void>{
    this.breadCrumbsItems = []
    this.fullRowData = item
    // действия на dblClick() - выбор редакции ТехКарты
    console.log("dblClicked", item)
    // скрываем основную страницу и отображаем разметку для выбранной редакции
    this.hideTechCards = true

    // готови данные для хлебных крошек
    let result = await techCardsController.getWorkPath(item.f_spWorks)
    let parsed = this.preparedDataToTable(result)

    //
    console.log("breadCrumbs",parsed.valuesTable)
    parsed.valuesTable.forEach((br) =>{
      this.breadCrumbsItems.push({
        text: br.fCode + "_" + br.fName
      });
    });

    if (item.f_SPTC === -1){
      this.type = "Основная"
    }
    else{
      this.type ="Альтернативная"
    }

    // таблица операций
    this.keyForTreeView =item.fkey

  }
  // возврат на главную страницу
  goBack() :void{
    this.hideTechCards = false
    this.prepareAllFilterFieldsData()
    // this.$router.replace({ name: 'techcardhome'})
    // this.prepareDataForTable()
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
        this.prevData = this.dataTable
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
    if (this.isFirstSelected){
      setTimeout(() => {
        if (this.dataTable.length === 0) {
          alert("Данные не найдены, они в другом замке!")
        }
      }, 500);
    }
    this.prevData = this.dataTable
  }
  // событие выбора позиции в treeView
  currSelectedTreeViewItem(item:any) : void {
    // обнуляем
    this.isMultiple=false
    this.states=null
    //this.skeleton = true
    // подготовка данных
    this.prepareDataForCostsTable(item)
  }

  // клик на чекбокс
  varClicked(panel:any):void{
    // если другой вариант был выбран активным, деактивируем предыдущий активный
    this.expArr.forEach((elem:any) => {
      (elem.key !== panel.key)? elem.isMain = false: undefined
    });
  }
  // раскрыть все
  expandAll():void{
    this.isMultiple = true
    this.states = [...Array(this.expArr.length).keys()].map((k, i) => i)
  }
  // закрыть все
  closeAll():void{
    this.isMultiple = true
    this.states = []
    this.isMultiple = false
  }
  // подготовка данных для дочерней таблицы (список Затрат)
  async prepareDataForCostsTable(item:any) : Promise<void> {
    // получаем количество вариантов/панелей
    let result = await techCardsController.getTC_Spends_Variants(item.id)
    let parsed = this.preparedDataToTable(result)

    // варианты
    let variants = parsed.valuesTable

    // управление признаком
    variants === [] || variants.length === 0? this.costsTableState=false:undefined;

    // вызываем анимацию
    if (this.costsTableState){
      this.costsTableState = false
      // имитация анимации
      setTimeout(() => {
        this.costsTableState = true
      }, 150);
    }

    // массив всех данных для expansionPanels
    let expData: any[] = []
    // tableData внутри одной панели
    let groupData: any = []
    // headers для таблицы расходов
    let headers: Header[] =[]

    // определяем количество expansionPanels
    for (const { index, elem} of variants.map((elem, index) => ({ index, elem }))) {
      // получаем данные по каждому варианту
      let dataRes = await techCardsController.getTC_Spends(elem.fkey,item.id,elem.fVariant);
      groupData = this.preparedDataToTable(dataRes);

      // единожды получаем headers
      !headers.length? headers = groupData.headersTable: undefined;

      // если вариант активный или единственный, открываем панель
      elem.fMain === "True" || variants.length ===1? this.states = index:undefined;

      // формируем данные
      expData.push({
        variant:elem,
        key: elem.fkey,
        isMain: elem.fMain === 'True',
        data: groupData.valuesTable,
      });
      // очищаем переменную для данных по варианту
      groupData = []
    }

    // сохраняем и передаем данные
    this.expArr = expData
    console.log("expData",expData)

    // передаем headers
    if (parsed.valuesTable !== undefined){
      this.costsHeaders = headers
      parsed.valuesTable.length ? this.costsTableState = true : this.costsTableState = false
    }
    else{
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
  .expPanel{
    padding-top:0;
    padding-bottom:0
  }
  .bread{
    padding:0;
    /*flex-wrap:nowrap;*/
  }
  /*::v-deep .v-data-table__wrapper{*/
  /*  height:350px*/
  /*}*/

</style>