<!--Автор: Волков Максим-->
<!--Комментарий: treeView, если ничего не передавать, пока выводит инфу по Операциям,
    можно передать свою коллекцию, либо только верхний уровень и включить динамическую подгрузку, в будущем сделаю универсальным-->
<template>
  <div style="height:100%" >
    <MessageBox
        :v-model="itemDeleteDialog"
        :title="'Удалить элемент ' + myTitle + ' №' + itemDeleteID + ' ?'"
        message="Хорошо подумайте прежде чем выполнить действие удаления, т.к. данная запись будет удалена, и не будет подлежать восстановлению."
        @result="deletItemForce"
    />
    <v-slide-y-transition>
    <v-card v-if="this.treeViewItems.length">
      <v-card-text>
        <div style="display:flex">

        <v-card-title style="color:black;padding:4px"> {{this.myTitle}}
          <v-divider style="margin-left:5px" vertical/>
          <v-btn v-if="this.clickedItem !== [] && this.clicked"
              small
              icon
              :depressed="false"
              center
              @click="undoSelected"
              style="color:red"
          >
            <v-icon small>mdi-arrow-u-left-top-bold</v-icon>
          </v-btn>

          <v-btn @click="openSearch" icon v-if="!isSearch">
            <v-icon color="green">mdi-magnify</v-icon>
          </v-btn>

          <v-btn @click="openSearch" icon v-if="isSearch">
            <v-icon
            color="red">mdi-magnify-close</v-icon>
          </v-btn>

          <div v-if="isSearch">
            <v-slide-x-reverse-transition>
              <v-sheet class="pa-3 primary lighten-2"
                       :elevation="8">
                <v-container row>
                  <v-text-field
                      ref="findStrField"
                      v-model="searchStr"
                      label="Поиск"
                      dense
                      dark
                      solo-inverted
                      hide-details
                      clearable
                      :filled="true"
                      clear-icon="mdi-close-outline"
                      @click:clear="clearSearch()"
                      @keydown.enter.prevent="findAction()"
                  >
                    <template v-slot:append-outer>
                      <v-btn @click="findAction()" icon>
                        <v-icon>mdi-play</v-icon>
                      </v-btn>
                    </template>
                  </v-text-field>
                  <v-checkbox v-model="caseSensitive"
                    dark
                    hide-details
                    label="регистр"
                    dense
                    off-icon="mdi-close-box"
                    :ripple="true"
                  />
                </v-container>
              </v-sheet>
            </v-slide-x-reverse-transition>
          </div>

          <v-btn v-if="!readOnly" icon @click="addNewElementOpenCard(undefined)">
            <v-icon>mdi-plus</v-icon>
          </v-btn>

        </v-card-title>

        </div>
        <div v-if="searchComplete">
          <h2>Результаты поиска: </h2>
        </div>
        <div v-if="searchComplete && searchResults.length === 0">
          <h3>Ничего не найдено</h3>
        </div>
        <v-flex xs12 style="overflow-x: hidden; overflow-y:auto; display:flex;">
          <v-treeview :style="`height: ${treeHeight};width: ${treeWidth}`"
                      v-model="selection"
                      ref="tree"
                      :open-all="openAll"
                      :items="treeViewItems"
                      :activatable="true"
                      :open-on-click="false"
                      :dense="true"
                      :search="search"
                      :filter="filterItems()"
                      :load-children="getChilds"
                      :active.sync="active"
                      :open.sync="open"
                      :return-object="true"
                      :expand-icon="iconPack===0?'mdi-pan-down':'mdi-arrow-down-thin'"
                      loading-icon="mdi-reload"
                      :transition="true"
                      :hoverable="true"
                      class="treeView"
                      :selectable="this.isselectable"
                      selected-color="green"
                      selection-type="independent"
          >

            <template v-slot:prepend="{item}">
              <v-icon v-if="item.children === undefined">
                {{iconPack===0?'mdi-order-bool-ascending':'mdi-briefcase'}}
                <!--minus-box-outline-->
              </v-icon>
              <v-icon v-else>
                {{iconPack===0?'mdi-file-tree':'mdi-folder-outline'}}
              </v-icon>
            </template>

            <template v-slot:label ="{item}">
              <span class="text-wrap" 
                  v-html="matchSearch(item.name)"
                  :style="[(item.children === undefined) ? ( item.haveDefaultTrud > 0 ? {'color':'red','font-weight':'bold'} : {'color':'black'} ) : {'color':''} ]">
                  {{item.name}}
              </span>
            </template>

            <template v-slot:append ="{item}">
              <div v-if="!disableMoving">
                <v-slide-x-transition>
                  <div v-if="item.id === clickedItem.id">
                    <v-btn icon
                          :depressed="false"
                          center
                          @click="moveDownOrUp(item,'UP')"
                          :style="[(conditionUp) ? {'color':'red'} : {'color':'green'}]"
                    >
                      <v-icon>
                        {{iconPack===0?'mdi-arrow-up-thin':'mdi-arrow-up-bold-outline'}}
                      </v-icon>
                    </v-btn>

                    <v-btn icon
                          :depressed="true"
                          center
                          @click="moveDownOrUp(item,'DOWN')"
                          :style="[(conditionDown) ? {'color':'green'} : {'color':'red'}]"
                    >
                      <v-icon>
                        {{iconPack===0?'mdi-arrow-down-thin':'mdi-arrow-down-bold-outline'}}
                      </v-icon>
                    </v-btn>
                  </div>
                </v-slide-x-transition>
              </div>
              <div v-else-if="!readOnly && item.id === clickedItem.id">
                <v-btn icon @click="addNewElementOpenCard(item.id)"> <v-icon>mdi-plus</v-icon> </v-btn>
                <v-btn icon :depressed="true" center @click="refreshEdit"> <v-icon>mdi-pencil-outline</v-icon> </v-btn>
                <v-btn icon @click="deleteItemDialogOpen(item.id)"> <v-icon>mdi-delete</v-icon> </v-btn>
              </div>
            </template>
          </v-treeview>
          <v-divider v-if="this.isselectable" vertical></v-divider>
          <div v-if="this.isselectable" class="pa-5" style="color:black">
            <h3>Выделенные записи: {{selection.length}}<v-divider/></h3><br>
            <template v-if="!selection.length">Нет выделенных записей...</template>
            <template v-else>
              <div
                v-for="node in selection"
                :key="node.id"
              >
                <div style="display:flex;"><v-checkbox @change="unCheckItem(node)" input-value="true" on-icon="mdi-close-box" color="red"/>{{node.name}}</div>
              </div>
            </template>
          </div>
        </v-flex>
      </v-card-text>
    </v-card>
    </v-slide-y-transition>
    <div v-if="this.isselectable" style="display: flex; position: sticky; bottom: 0; z-index: 999" class="pa-5 grey lighten-4">
        <v-btn depressed color="error" @click="closeCard(false)">Отменить</v-btn>
        <v-spacer></v-spacer>
        <v-btn depressed color="primary" @click="saveChanges">Сохранить</v-btn>
    </div>

    <v-dialog
      persistent
      v-model="cardStateEdit"
      max-width="50%"
      v-if="cardStateEdit"
    >
      <EditCard
        :headers="this.cardHeaders"
        :data="cardStateAdd?undefined:this.cardData"
        :forEdit="!cardStateAdd"
        :for-edit="true"
        @closed="refreshEdit"
        :defaultRow="cardStateAdd?this.defaultData:undefined"
      />
    </v-dialog>

      <notification-hub
        :text="textNotify"
        :state="needNotify"
        :timeout="-1"
        backgroundColor="black"
      />

  </div>
</template>


<script lang="ts">

// импорты библиотек и компонентов
import {Component, Prop, Vue, Watch} from 'vue-property-decorator'
import {mixins} from "vue-class-component";
import {tableMixin} from "@/mixins/tableMixin";
import {techCardsController} from "@/controllers/techCardsController";
import {baseController} from "@/controllers/baseController";
import {TreeViewDataModel, TreeChild, TreeParent} from "@/models/TreeViewDataModel";
import {Header} from "@/models/TableDataModel";
import Preloader from "@/ui/Preloader.vue";
import MessageBox from '@/ui/MessageBox.vue'
import NotificationHub from "@/views/NotificationHub.vue"

// регистрация компонентов
@Component({
  components : {Preloader, EditCard: () => import("@/ui/EditCard.vue"), MessageBox, NotificationHub }
})
// описание класса компонента ComboPicker
export default class TreeView extends mixins(tableMixin) {
  // ключ кликнутой записи(пока используется только для операций)
  @Prop() clickedKey: number
  // имя таблицы, которая будет отображаться по нажатию кнопки в диалоге
  @Prop() myItems: { id: number, name: string, key:number, number:string, children: TreeChild[]}[]
  // отключает возможность перемещения элементов (пока работает только для 2-х уровней вложенности)
  @Prop({ default: true }) disableMoving: boolean
  // раскрывает все узлы при открытии, по умолчанию true
  @Prop() expandAll: boolean
  // динамическая загрузка потомка
  @Prop({ default: false }) dynamicLoading: boolean
  //имя таблицы
  @Prop({ default: undefined }) bdName: string
  // имя для treeView
  @Prop({ default: "Дерево элементов" }) myTitle: string
  // высота дерева
  @Prop({ default: "400px" }) treeHeight: any
  // ширина дерева
  @Prop({ default: "800px" }) treeWidth: any
  // набор иконок
  @Prop({ default: 0 }) iconPack: any
  // можно выделять
  @Prop({ default: false }) isselectable: boolean
  // выделенные обьекты
  @Prop() selectedKeys: any[]
  // режим только чтение
  @Prop({default: true}) readOnly: boolean
  // режим выбора одной записи
  @Prop({default: false}) isSoloSelect: boolean
  
  private isLoaded = false
  // список открытых веток
  private openedParents: any[]
  // массив для хранения родительских узлов treeView
  private treeViewParents: TreeParent[] = []
  // массив для хранения дочерних узлов treeView
  private treeViewChildrens: TreeChild[] = []
  // отсортированный массив данных для treeView
  private treeViewItems: { id: number, name: string, key:number, number:string ,children: TreeChild[] }[] = []
  // копия массива данных
  private treeViewItemsCopy: { id: number, name: string, key:number, number:string ,children: TreeChild[] }[] = []
  // несортированный массив данных для treeView
  private unsorted: { id: number, name: string, key:number, number:string ,children?: TreeChild[] }[] = []
  // кликнутый элемент treeView
  private clickedItem: any = []
  // активный элемент treeView
  private active = []
  // предыдущий активный элемент treeView
  private prevActive = []
  // данные для таблицы операций редакций ТехКарт
  private operationsDataTable : any[] = []
  // признак для управления цветом стрелки вниз
  private conditionDown = false
  // признак для управления цветом стрелки вверх
  private conditionUp = false
  // состояние выбранного элемента
  private clicked = false
  // отключение логики перемешения элементов
  private isDisabled = false
  // массив открытых элементов treeView
  private open: any[] = []
  // массив открытых элементов treeView
  private lastOpen: any[] = []
  //Выделенные элементы
  private selection: any[] = []
  // строка поиска
  private search=""
  private searchStr=""
  // учитывать регистр при поиске
  private caseSensitive = false
  // состояние поиска
  private isSearch = false
  // поиск выполнен
  private searchComplete = false
  // если список одноуровневый
  private isOnlyParents = false
  // открытие всех уровней
  private openAll = true
  // результаты поиска
  private searchResults: any[] = []
  //карточка для редактирования
  private cardHeaders: Header[]
  private cardData: any
  private cardStateEdit = false
  private cardStateAdd = false
  private defaultData: any[]
  //Delete state
  private itemDeleteDialog = false
  private itemDeleteID = 0
  //notify
  private needNotify = false
  private textNotify = ""

  // крюк на создание
  async created():Promise<void>{
    // раскрыть все элементы или нет
    this.checkExpandState();
    // выбираем коллекцию treeViewItems
    this.checkHasAnotherItems();

    //Открыть всех потомков до выбранных элементов
    if (this.selectedKeys !== undefined) {
      if (this.selectedKeys.length > 0) {
        let Parents = await baseController.getTreeRoot(this.bdName, this.selectedKeys.toString())
        //console.log("Parents", Parents)
        const [headers, ...data] = Parents.data.map((el:any)=>el.fkey)
        this.openedParents = data
      }
    }

    //(this.myItems === undefined)? (this.bdName === undefined)? await this.prepareDataForTreeView() : await this.prepareDataForTreeViewClear() : undefined
    if (this.myItems === undefined) {
      if ((this.bdName === undefined)) {
        await this.prepareDataForTreeView()
      } else {
        await this.prepareDataForTreeViewClear()
      }
    }    

    this.isLoaded = true

    //выбрать первый элемент
    if (!this.isSoloSelect) {
      this.onSelectedTreeViewItem(this.treeViewItems[0])
    }
  }

  @Watch("expandAll", {deep: true})
  checkExpandState():void{
    (this.expandAll !== undefined) ? this.openAll=this.expandAll: undefined
  }

  // передаем полученную коллекцию, если она есть
  @Watch("myItems", {deep: true})
  checkHasAnotherItems():void{
    (this.myItems !== undefined)? this.treeViewItems = this.myItems: undefined
  }

  // фильтр items при поиске
  filterItems():any{
    if (this.search){
      return this.caseSensitive? (item:any, search:string, textKey:any) => item[textKey].indexOf(search) > -1 :undefined;
    }
  }

  // подсветка на основе поиска
  matchSearch(currentName:string) :any{
    let reggie = new RegExp(this.search, "ig");
    let found = currentName.search(reggie) !== -1;
    return !found ? currentName : currentName.replace(reggie, '<b style="background-color:#EDE4E4;color:black">' + this.search + '</b>');
  }

  // линейный поиск в дереве
  async findAction(){
    this.searchComplete = false
    this.searchResults = []
    if (this.treeViewItemsCopy.length === 0)
    {
        this.treeViewItemsCopy = this.treeViewItems   // сохраняем дерево
    }
    let results = await baseController.getSearchResult(this.bdName, this.searchStr);
    const [headers, ...data] = results.data

    // переформируем под класс TreeViewDataModel
      data.forEach((elem:any,index:any) => {
        this.searchResults.push({
        id: elem.fkey,
        name: (elem.fCode !== undefined ? elem.fCode + " " : "") + (elem.fName !== undefined ? elem.fName : ""),
        key: elem.fkey,
        number: elem.fkey.toString(),
        children: undefined
        });
      });

    let searchKeys = this.searchResults.map((el:any) => el.id)

    this.selection.forEach((el: any) => {
      if (!searchKeys.includes(el.id))
      {
        this.searchResults.push(el)
      }
    })

    if (this.searchResults.length > 0)
    {
      this.treeViewItems = this.searchResults.sort((a, b) => a.name > b.name ? 1 : -1);
    }
      this.search = this.searchStr
      this.searchComplete = true
  }

  // открыть/закрыть поиск
  openSearch() : void {
    this.isSearch = !this.isSearch
    this.search = ""
    this.searchStr = ""
    if (!this.isSearch && this.searchComplete)
    {
      this.treeViewItems = this.treeViewItemsCopy
      this.searchComplete = false
    }
    //Установить фокус на поле ввода
    setTimeout(() => {
      const findStrField = this.$refs.findStrField
      // eslint-disable-next-line no-prototype-builtins
      if (findStrField !== undefined) { (findStrField as Vue & { focus: () => boolean }).focus() }
    })
  }

  // удалить строку поиска
  clearSearch() : void {
    this.search = ""
    this.searchStr = ""
    if (this.searchComplete)
    {
      this.treeViewItems = this.treeViewItemsCopy
      this.searchComplete = false
    }
  }

  // динамическая загрузка дочернего узла
  async getChilds(item: any, startLoad: any = false) :Promise<void>{
    if (this.dynamicLoading){
      let response = await techCardsController.getTreeBranch(this.bdName,item.id)
      let result = this.preparedDataToTable(response)
      let some: TreeChild[] = []
      // переформируем под класс TreeChild
      result.valuesTable.forEach((elem,index) => {
        some.push({
          id: elem.fkey,
          name: (elem.fCode !== undefined ? elem.fCode + " " : "") + " " + (elem.fName !== undefined ? elem.fName : ""),
          parentId: item.id,
          index: index,
          number: item.id + "-" + index.toString(),
          children: elem.Child === "1"? [] : undefined
        });
      });
      // добавляем и открываем узел
      if (some !== undefined && item.children !==undefined && item.children.length === 0) {
        item.children.push(... some)
        //self.open = item;
        //console.log('this.open.push(item)',item)
        if (startLoad===true) {
          this.open.push(item)
          this.isNeedToCheck(item)        
        }
      }
    }
  }

  async prepareDataForTreeViewClear()
  {
    let response = await techCardsController.getTreeBranch(this.bdName,-1)
    let result = this.preparedDataToTable(response)
    let some: any[] = []

    // переформируем под класс TreeViewDataModel
    result.valuesTable.forEach((elem,index) => {
      some.push({
      id: elem.fkey,
      name: (elem.fCode !== undefined ? elem.fCode + " " : "") + (elem.fName !== undefined ? elem.fName : ""),
      key: elem.fkey,
      number: index.toString(),
      children: elem.Child === "1"? [] : undefined
      });
    });

    //return some
    this.treeViewItems = some

    if (this.openedParents !== []) {
        some.forEach((el)=>{
        //console.log('next child',el)
        this.isNeedToOpen(el)
      })
    }
  }

  //раскрываем нужные ветки
  async isNeedToCheck(item: any) {    
    if (this.openedParents !== [] && this.openedParents !== undefined) {
      item.children.forEach((el:any)=>this.isNeedToOpen(el))
    }
    //помечаем нужные галки на элементах
    if (this.selectedKeys !== [] && this.selectedKeys !== undefined) {
      item.children.forEach((el:any)=> {
        this.selectedKeys.forEach(async(op,index)=> {
          if (el.id === op) {
            await this.getChilds(el,false)
            this.selection.push(el)
            this.selectedKeys.splice(index,1)
          }
        })
      })
      //console.log("this.selection", item.id, item.parent, this.selection)
    }
  }

  //открываем ветки родителей которые нужно раскрыть
  async isNeedToOpen(item:any) {
    if (this.openedParents !== undefined) {
      this.openedParents.forEach((el,index)=> {          
        if (item.id === el) {
          if (item.children.length === 0) {
              this.getChilds(item,true)
          }
          this.openedParents.splice(index,1)
        }
      })
    }
  }

  // подготовка данных для treeView операций
  async prepareDataForTreeView() :Promise<void>{
    let dataTable = await techCardsController.getTC_Opers(0,this.clickedKey)
    let result = this.preparedDataToTable(dataTable)

    this.operationsDataTable = result.valuesTable

    //console.log("opsData",this.operationsDataTable)
    this.unsorted = this.treeViewItems
    let childKey = 0
    // получаем потомков для treeView
    this.operationsDataTable.forEach((elem) =>{
      if (elem.f_spTC_Opers === ""){
        this.treeViewParents.push({
          id: elem.fkey,
          name: (elem.fNum !== undefined ? elem.fNum : elem.fCode) + ". " + (elem.spOpersName != undefined ? elem.spOpersName : ""),
          key: elem.fkey,
          number: (elem.fNum !== undefined ? elem.fNum : elem.fCode)
        });
      }
    });

    // по циклу для каждого потомка получаем список родителей
    this.treeViewParents.forEach((parent) =>{
      this.operationsDataTable.forEach((child) =>{
        if (parent.key === child.f_spTC_Opers){
          this.treeViewChildrens.push({
            id: child.fkey,
            name: (child.fNum !== undefined ? child.fNum : child.fCode) + " " + (child.spOpersName !==undefined ? child.spOpersName : ""),
            parentId: parent.id,
            index: childKey++,
            number: (child.fNum !== undefined ? child.fNum : child.fCode)
          });
        }
      });
      // пушим узел с потомками
      this.unsorted.push({
        id: parent.id,
        name: parent.name,
        key: parent.key,
        number: parent.number,
        children: (this.hasChild(parent.id))? this.treeViewChildrens : undefined
      });
      // очищаем потомков
      this.treeViewChildrens = []
    });
    this.isOnlyParents = this.checkIsOneLevelList(this.treeViewItems)
    this.treeViewItems = this.sortIt(this.unsorted,"asc",)
    this.isLoaded = true
  }
  // проверка на одноуровневый список
  checkIsOneLevelList(treeItems: any[]):boolean{
    return treeItems.find(t=>t.children === undefined) !== undefined
  }
  // проверяем есть ли потомки у первого узла операций
  hasChild(key:number): any{
    let has = false
    let arr = this.operationsDataTable
    for (let i = 0; i < arr.length; i++){
      if (arr[i].f_spTC_Opers === key){
        has = true
        break;
      }
    }
    return has
  }

  // отменить выбор
  undoSelected() : void{
    this.clickedItem = []
    this.clicked = false
    // console.log("clicked11",this.clickedItem)
  }
  // клик на элемент(именно состояния выбора элемента)
  @Watch("active", {deep: true})
  activeItem(arr:any[]):void {
    // не вызываем срабатывание клика на том же самом элементе, чтобы не вызвать конфликт с событием клика на кнопки сдвига
    if (arr.length && arr !== this.prevActive) {
      this.onSelectedTreeViewItem(arr[0])
    }
    this.prevActive = arr[0];
  }

  // событие выбора позиции в treeView
  onSelectedTreeViewItem(item:any) : void {
    this.clicked = true
    this.clickedItem = item;
    !this.isDisabled? this.highlightArrows(item) : undefined
    //эмит события выбора элемента
    this.$emit("selectedItem", item)
  }

  // подсветка стрелок
  highlightArrows(currItem: any):void {
    if (currItem !== undefined) {
      if (currItem.children === undefined) {
        //console.log("childNode");
        let currDigit=""
        if (currItem.number !== undefined) {
          currDigit = this.isOnlyParents ? currItem.number : currItem.number.split('.')[1]
        }

        // определяем текущую длину массива потомков
        let length = 0;
        let currPar = this.treeViewItems.find(p=>p.id === currItem.parentId);
        (currPar !== undefined) ? (currPar.children !== undefined) ? length = currPar.children.length :undefined : undefined;

        if (currDigit !== undefined) {
        // изменяем подсветку стрелки вверх
        (currDigit.toString() === "1" || this.treeViewItems.length === 1)? this.conditionUp = true: this.conditionUp = false;
        // изменяем подсветку стрелки вниз
        (parseInt(currDigit) < length)? this.conditionDown = true: this.conditionDown = false;
        }
      }
      else{
        //console.log("parentNode");
        // изменяем подсветку стрелки вверх
        (currItem.number.replace(".","") === "1")? this.conditionUp = true: this.conditionUp = false;
        // изменяем подсветку стрелки вниз
        (currItem.number.replace(".","") < this.treeViewItems.length)? this.conditionDown = true: this.conditionDown = false;
      }
    }
  }

  // события перемещения операции вниз
  moveDownOrUp(item:any, direction:string):void{
    let currItems = this.treeViewItems
    // проверяем была ли изменена treeVieWItems
    let isAffected = false

    // индекс сдвига элемента, на место которого встанет текущий
    let shiftIndex = 0
    // индекс сдвига текущего элемента
    let newIndex = 0
    // корректирующий индекс сдвига для перемещения вверх
    let upIndex = 0

    // устанавливаем индексы в зависимости от направления
    if (direction === "UP"){
      shiftIndex = -1
      newIndex = 0
      upIndex = 2
    }
    if (direction === "DOWN"){
      shiftIndex = 1
      newIndex = 2
      upIndex = 0
    }
    //console.log("curItemDownOrUp",item)
    // если текущий элемент является потомком
    if (item.children === undefined){
      if (this.isOnlyParents){
        for (let i = 0; i < currItems.length; i++) {
          if (currItems[i].name === item.name) {
            // проверяем возможность сдвига и сдвигаем элементы
            if (this.canMove(i, currItems.length - 1, direction)) {
              isAffected = true
              this.swapParents(currItems,i,shiftIndex,upIndex,newIndex)
            }
          }
        }
      }
      else {
          currItems.forEach((elem) =>{
            // является ли потомком текущего родителя
            if (elem.id === item.parentId)
            {
              let arr = elem.children

              for (let i = 0; i < arr.length; i++){
                if (arr[i].index === item.index){
                  // проверяем возможность сдвига и сдвигаем элементы
                  if (this.canMove(i, arr.length-1,direction)){
                    isAffected = true
                    this.swapChild(arr,elem.number,i,shiftIndex,upIndex,newIndex)
                  }
                }
              }
            }
          });
        }

      // применяем сортировку по возрастанию и обновляем treeView, если она изменилась
      isAffected? this.treeViewItems = this.sortIt(currItems,"asc"): undefined
    }
    // если текущий элемент является родителем
    else {
      for (let i = 0; i < currItems.length; i++) {
        if (currItems[i].name === item.name) {
          // проверяем возможность сдвига и сдвигаем элементы
          if (this.canMove(i, currItems.length - 1, direction)) {
            isAffected = true
            this.swapParents(currItems,i,shiftIndex,upIndex,newIndex)
          }
        }
      }
      if (isAffected) {
        // перенумеруем потомков
        currItems.forEach((elem) => {
          if (elem.children !== undefined) {
            elem.children.forEach((ch) => {
              ch.name = elem.number + "." + ch.number.split(".")[1] + ch.name.replace(ch.number, "")
              ch.number = elem.number + "." + ch.number.split(".")[1]
            });
          }
        });
      }
      // применяем сортировку по возрастанию и обновляем treeView, если она изменилась
      isAffected ? this.treeViewItems = this.sortIt(currItems, "asc") : undefined
    }
  }

  // поменять родителей
  swapParents(currItems: any[], i:number,shiftIndex:number,upIndex:number,newIndex:number) : void{
    currItems[i + shiftIndex].name = (i + shiftIndex + upIndex).toString() + "." + currItems[i + shiftIndex].name.replace(currItems[i + shiftIndex].number + ".", "");
    currItems[i + shiftIndex].number = (i + shiftIndex + upIndex).toString()

    currItems[i].name = (i + newIndex).toString() + "." + currItems[i].name.replace(currItems[i].number + ".", "");
    currItems[i].number = (i + newIndex).toString()
  }

  // поменять потомков
  swapChild(arr: any[], currNumber:string, i:number,shiftIndex:number,upIndex:number,newIndex:number): void{
    arr[i+shiftIndex].name = currNumber + "." + (i+shiftIndex+upIndex).toString() + arr[i+shiftIndex].name.replace(arr[i+shiftIndex].number, "");
    arr[i+shiftIndex].number = currNumber + "." + (i+shiftIndex+upIndex).toString()

    arr[i].name = currNumber + "." + (i+newIndex).toString() + arr[i].name.replace(arr[i].number, "");
    arr[i].number = currNumber + "." + (i+newIndex).toString()
  }

  // сортировка treeViewItems
  sortIt(fullItems:any[], sortType:string) : any[]{
    fullItems.forEach((elem) => {
      if (elem.children !== undefined){
        elem.children = this.sorted(elem.children,elem.number,sortType)
      }
    });
    // сортируем родителей
    return this.sorted(fullItems,"",sortType)
  }

  //сортировка treeViewItems внутри потомков
  sorted(treeViewItems:any[],parentNum:string, sortType:string) : any[] {
    if (sortType === "asc") {
      return treeViewItems.sort((a: { number: string }, b: { number: string }) =>
          parseInt(a.number.replace(parentNum + ".", ""))
          < parseInt(b.number.replace(parentNum + ".", "")) ? -1 : 1)
    }
    if (sortType === "desc") {
      return treeViewItems.sort((a: { number: string }, b: { number: string }) =>
          parseInt(a.number.replace(parentNum + ".", ""))
          > parseInt(b.number.replace(parentNum + ".", "")) ? -1 : 1)
    }
    return[]
  }

  // проверка на возможность сдвига операции
  canMove(i:number,arrayLength:number,direction:string):boolean{
    if (arrayLength === 0){
      alert("Невозможно сдвинуть единственную позицию!")
      return false
    }

    if (i === arrayLength){
      if (direction === "DOWN"){
        alert("Невозможно сдвинуть последнюю позицию ниже!")
        return false
      }
      else{
        return true
      }
    }

    if (i === 0){
      if (direction === "UP"){
        alert("Невозможно сдвинуть первую позицию выше!")
        return false
      }
      else{
        return true
      }
    }
    return true
  }

  async saveChanges() {
      //console.log("selection",this.selection);
      this.$emit("chosenRow",this.selection)
      this.closeCard(true)
  }

  closeCard(needUpate:any):any {
      if (needUpate) this.$emit("needUpdateCard")
      this.$emit("closed") // Обьект который содержит выбранные критерии
  }

  unCheckItem(item: any) {
    //console.log("IncheckItem",item)
    this.selection.forEach(async(op,index)=> {
      if (item.id === op.id) {
        this.selection.splice(index,1)
      }
    }) 
  }

  async refreshEdit(insertResult?: any) {
    if (!this.cardStateEdit) {
      //Получаем выбранный объект по ключю, получаем данные для карточки
      const result = await baseController.GetTable(this.bdName, this.clickedItem.id)
      let dataTableParsed = this.preparedDataToTable(result)
      this.cardHeaders = JSON.parse(JSON.stringify(dataTableParsed.headersTable))
      this.cardData = Object.values(dataTableParsed.valuesTable[0])
    } else {
      //Получаем новый уже изменный объект, и обновляем выбранный обьект нашими данными
      if (insertResult !== undefined) {
        //Если это новый обьект то добавляем его в дерево, если былло редактирование то обновляем данные
        if (this.cardStateAdd == true) {
          const newID = parseInt(insertResult.data)
          if (newID > 0) {
            const result = await baseController.GetTable(this.bdName, newID)
            const dataTableParsed = this.preparedDataToTable(result)
            const newItem = dataTableParsed.valuesTable[0]
            if (this.clickedItem.children === undefined) { this.clickedItem.children = [] }
            this.clickedItem.children.push({
              id: newID,
              fCode: newItem.fCode,
              name: (newItem.fCode !== undefined ? newItem.fCode + " " : "") + (newItem.fName !== undefined ? newItem.fName : ""),
              key: newID,
              number: newID.toString(),
              children: undefined,
            })
          }
        } else {
          const result = await baseController.GetTable(this.bdName, this.clickedItem.id)
          const dataTableParsed = this.preparedDataToTable(result)
          const newItem = dataTableParsed.valuesTable[0]
          this.clickedItem.name = (newItem.fCode !== undefined ? newItem.fCode + " " : "") + (newItem.fName !== undefined ? newItem.fName : "")
          //Если сменился родитель то надо найти этого родителя и перенести туда выделенный элемент
          if (this.clickedItem.parentId != newItem.f_spPodr) {
            //Создаем элемент в другой папке
            const findItem = this.findElement(this.treeViewItems, newItem.f_spPodr)
            if (findItem != undefined) {
              if (findItem.parent[findItem.index].children === undefined) { findItem.parent[findItem.index].children = [] }
              findItem.parent[findItem.index].children.push(this.clickedItem)
            }
            //удаляем элемент в текущей папке
            const oldParent = this.findElement(this.treeViewItems, this.clickedItem.parentId)
            if (oldParent.parent[oldParent.index].children !== undefined) {
              oldParent.parent[oldParent.index].children.forEach((el:any, index:any) => { 
                if (el.id == this.clickedItem.id) {
                  oldParent.parent[oldParent.index].children.splice(index,1)
                }
              })
              //удаляем всех потомков
              if (oldParent.parent[oldParent.index].children.length == 0) {
                oldParent.parent[oldParent.index].children = undefined
              }
            }
          }
        }
      }      
    }
    this.cardStateEdit = !this.cardStateEdit
    this.cardStateAdd = false
  }

  async addNewElementOpenCard(id?:any) {
    //Получаем заголовок данных, срабатывает один раз
    if (this.cardHeaders === undefined) {
      const result = await baseController.GetTable(this.bdName, 1)
      let dataTableParsed = this.preparedDataToTable(result)
      this.cardHeaders = JSON.parse(JSON.stringify(dataTableParsed.headersTable))
    }
    //Вычисляем ветку в которой находимся и решаем надо передавать в карточку родителя или нет
    if (id !== undefined) {
      this.defaultData = [{key: 'f_' + this.bdName, value:  id}]
    } else (this.defaultData = [])

    this.cardStateEdit = !this.cardStateEdit
    this.cardStateAdd = true
  }

  deleteItemDialogOpen(index: number) {
    //console.log("index",index)
    this.itemDeleteID = index
    this.itemDeleteDialog = !this.itemDeleteDialog
  }

  async deletItemForce(result: any = true) {
    if (result === true) {
      this.itemDeleteDialog = !this.itemDeleteDialog
      if (this.bdName !== null && this.bdName !== "" && this.itemDeleteID > 0) {
        if (this.clickedItem.children != null) {
          this.needNotify = true
          this.textNotify = "Удаление отменено! Нельзя удалить ветку дерева у которой есть вложенные объекты!"
          setTimeout(()=>{this.needNotify = false}, 3000)
        }
        else {
          await baseController.applyTableChanges([{"tblName": this.bdName, "fkey": -this.itemDeleteID}])
          let findItem = this.findElement(this.treeViewItems, this.itemDeleteID)
          findItem.parent.splice(findItem.index,1)
        }
      }
    } else {
      this.itemDeleteID = 0
      this.itemDeleteDialog = !this.itemDeleteDialog
    }
  }

  findElement(item:any[], inp_id: any): any {
    for(var index in item) {
      if (item[index].id === inp_id) {
        return {parent:item, index:index}
      }
      if (item[index].children !== undefined) {
        const findItem = this.findElement(item[index].children, inp_id)
        if (findItem != null) return findItem
      }
    }
    return null
  }

}

</script>

<style scoped>
.combo{
  width:fit-content
}
.v-input--selection-controls {
  margin-top: 0px;
  padding-top: 0px;
}

</style>