<template>
  <div>
    <v-card style="background-color:white;"
    >
      <v-toolbar dark color="primary">
        <v-btn color="blue" text @click="closePTNTree" icon> 
          <v-icon style="size:8px" color="white">mdi-close</v-icon>
        </v-btn>
        <h3>Подбор трудоемкости</h3>
      </v-toolbar>
      <div style="display:flex;width:99%;">
        <div style="width:40%;">
          <div style="display:flex;">
            <v-combobox
              v-model="selectedComboBoxItems"
              :items="selectedCriteria"
              item-text="fName"
              label="Критерии"
              multiple
              outlined
              @change="refreshAnalogList"
              class="my-3"
              hide-details
            >
              <template v-slot:selection="data">
                <v-chip
                  :key="JSON.stringify(data.item)"
                  v-bind="data.attrs"
                  :input-value="data.selected"
                  :disabled="data.disabled"
                  dark
                  :color="checkCriterialColor(data.item)"
                >
                  {{ (data.item.fName.length > 30 ? data.item.fName.substring(0, 30) + '...' :  data.item.fName) }}
                </v-chip>
              </template>
            </v-combobox>
            <v-btn @click="openCardCriteria" icon x-large>
              <v-icon color="green">mdi-lead-pencil</v-icon>
            </v-btn>
          </div>
          <TreeView
            myTitle="Этапы и операции"
            :myItems="this.PTNTreeItems"
            tree-height="max-content"
            @closed="openPTNTree"
            :iconPack="1"
            :expandAll="expandAll"
            @selectedItem="selectTreeBranch"
            treeHeight="700px"
          />
        </div>
        <v-card v-if="this.AnalogListState" style="width:60%;">
          <v-card-title>
            <v-alert icon="mdi-information-outline" dense prominent text type="info">{{this.lastTreeBranch.name}}</v-alert>
            <v-container style="display:flex;width:100%;">
              <div v-if="this.dataAnalogList.length>0" style="display:flex;">
                <v-text-field readonly rounded label="Минимум" class="ma-2" :value="this.presentTrudValues.min" type="number" hide-details dense/> 
                <v-text-field readonly rounded label="Среднее" class="ma-2" :value="this.presentTrudValues.avg" type="number" hide-details dense/>
                <v-text-field readonly rounded label="Максимум" class="ma-2" :value="this.presentTrudValues.max" type="number" hide-details dense/>
              </div>
              <div v-else style="display:flex;">
                <v-text-field outlined label="Минимум" class="ma-2" v-model="presentTrudValues.hand_min" type="number" hide-details dense/>
                <v-text-field outlined label="Максимум" class="ma-2" v-model="presentTrudValues.hand_max" type="number" hide-details dense/>
                <v-btn x-large color="blue" @click="()=>this.lastTreeBranchTrud = (this.presentTrudValues.hand_min*2 + this.presentTrudValues.hand_max*3)/5" icon>
                  <v-icon x-large>mdi-arrow-right-bold</v-icon>
                </v-btn>
              </div>
              <v-spacer/>
              <div v-if="this.lastTreeBranchTrud_old !== this.lastTreeBranchTrud">
                <v-btn x-large color="green" @click="saveTrud" icon>
                  <v-icon x-large>mdi-database-refresh-outline</v-icon>
                </v-btn>
              </div>
              <v-text-field style="width:30%;" class="ma-2" v-model="lastTreeBranchTrud" label="Трудоекость операции" outlined type="number" hide-details dense/>           
            </v-container>
          </v-card-title>
          <v-card-text v-if="this.dataAnalogList.length==0">
            <v-alert icon="mdi-information-variant" outlined prominent type="error">Аналогов на выбранный вид работ не найдено</v-alert>
          </v-card-text>
          <v-card-text v-else>
            <v-alert v-if="this.haveDefaultTrud>0" 
              icon="mdi-information-variant" 
              @dblclick="haveDefaultTrudClick(haveDefaultTrud)"
              outlined prominent type="error">
                Есть дефолтное значение <strong>{{this.haveDefaultTrud}}</strong>
                , и оно <strong>{{ this.haveDefaultTrud != this.lastTreeBranchTrud ? 'не' : '' }} совпадает</strong> с текущим значеним
                , нажмите чтобы применить это значение...
            </v-alert>
            <v-data-table
              :headers="proc_headers"
              :items="proc_items"
              class="elevation-3"
              disable-pagination
              disable-filtering
              fixed-header
              hide-default-footer
              :expanded.sync="expanded"
              show-expand
              :single-expand="false"
              item-key="critProc"
              :sort-by.sync="sortColumn"
              :sort-desc.sync="sortColumnDesc"
              @dblclick:row="procListDblClick"
            >
              <!-- eslint-disable-next-line -->
              <template v-slot:item.critProc="{ item }">
                <v-chip dark :color="getColor(item.critProc)"> {{ item.critProc }} </v-chip>
              </template>

              <template v-slot:expanded-item="{ headers, item:itemParent }">
                <td :colspan="headers.length" class="pa-4">
                  <v-data-table
                    dense
                    :items-per-page=-1
                    :headers="headersAnalogList"
                    :items="dataAnalogList.filter((el)=>el.critProc == itemParent.critProc)"
                    v-model="selected"
                    @dblclick:row="analogListDblClick"
                    @click:row="analogListClick"
                  >
                    <!-- eslint-disable-next-line -->
                    <template v-slot:item.critProc="{ item }">
                      <div v-if="item === selectedItem && selectedField === 'critList'">
                        <notification-hub
                          :isChips="true"
                          :text="getCritList(selectedItem)"
                          :state="item === selectedItem ? true : false"
                          :timeout="-1"
                          backgroundColor="white"
                        />
                      </div>
                        <v-chip dark :color="getColor(item.critProc)"
                          @mouseover="selectCritList(item)" @mouseout="unSelectItem()"
                        >{{ item.critProc }}</v-chip>	
                    </template>

                    <!-- eslint-disable-next-line -->
                    <template v-slot:item.critKeys="{ item }">
                        {{item.critKeys.split(',').length}}
                    </template>

                    <!-- eslint-disable-next-line -->
                    <template v-slot:item.fDescription="{ item }"
                    >
                    <div v-if="item === selectedItem && selectedField === 'fFullDescription'">
                        <notification-hub
                          :text="getFullDesc(selectedItem)"
                          :state="item === selectedItem ? true : false"
                          :timeout="-1"
                          backgroundColor="black"
                        />
                      </div>
                      <div
                      @mouseover="selectDesc(item)" @mouseout="unSelectItem()"
                      >
                        {{item.fDescription}}</div>
                    </template>

                  </v-data-table>
                </td>
              </template>
            </v-data-table> 
          </v-card-text>
        </v-card>
      </div>
    </v-card>    

    <v-dialog
        v-model="openCardCriteriaCard"
        width="auto"
        v-if="openCardCriteriaCard"
    >
      <TreeView
        bdName ="spCriteria"
        myTitle="Критерии"
        :expand-all="false"
        :dynamic-loading="true"
        tree-height="max-content"
        :iconPack ="1"
        :isselectable="true"
        @closed="openCardCriteria"
        @chosenRow="updateCardCriteria"
        :selectedKeys="this.selectedKeysCriteria"
      />
    </v-dialog>

  </div>
</template>

<script lang="ts">
import {Component, Prop} from 'vue-property-decorator'
import BaseTable from "@/ui/BaseTable.vue";
import {Header} from "@/models/TableDataModel";
import {ordersController} from "@/controllers/ordersController";
import {mixins} from "vue-class-component";
import {tableMixin} from "@/mixins/tableMixin";
import TreeView from "@/ui/TreeView.vue";
import NotificationHub from "@/views/NotificationHub.vue"


@Component({
  components: {BaseTable, TreeView, NotificationHub}
})
export default class PTNSelect extends mixins(tableMixin) {
  
@Prop() orderKey: number

private AnalogListState = false
private dataAnalogList: any[] = []
private headersAnalogList: any[] = []
private lastTreeBranch: any
private lastTreeBranchTrud_old: any = -1
private lastTreeBranchTrud: any = []
private selectedComboBoxItems: any[] = []
private lastCriteriasList:any = []
private presentTrudValues = {min:0, avg:0, max:0, hand_min:10, hand_max:100}
private colorPassive = "grey"
private colorActive = "lime"
private PTNTreeItems: any[] = []
private selectedKeysCriteria : any[] = []
private selectedCriteria: any[] = []
private fullDescriptions: any[] = []
private selectedItem: any = null
private selectedField = ""
private expandAll = false
private sortColumn = "critProc"//"resProc"
private sortColumnDesc = true
private haveDefaultTrud = 0

//Сохраненные Галки на ветках
private treeBranchCriteria: any = []

private openCardCriteriaCard = false  
private selected: any[] = []

private proc_items: any[] = []
private proc_headers = [  
  { text: 'Позиций', value: 'count' },
  { text: 'Минимальное', value: 'min' },
  { text: 'Среднее', value: 'avg' },
  { text: 'Макс', value: 'max' },
  //{ text: '% подходимость', value: 'resProc' },
  { text: '% совпадения', value: 'critProc' },
  { text: '', value: 'data-table-expand' },
]
private expanded: any [] = []

async created() {
  await this.openPTNTree()
}

closePTNTree() {
  this.$emit("closed")
}

async openPTNTree() {
  this.lastCriteriasList = []
  let response = await ordersController.GetOrdersStep(0,this.orderKey)
  let result = this.preparedDataToTable(response).valuesTable
  let some: any[] = []
  for(var index in result) {
    const elem = result[index]
    let child = await this.getSpecBranch(elem.fkey)
    some.push({
      id: elem.fkey,
      name: (elem.fNumber !== undefined ? elem.fNumber + " " : "") + " " + (elem.fDescription.length > 150 ? elem.fDescription.substring(0, 100) + '...' :elem.fDescription),
      parentId: this.orderKey,
      index: index,
      number: this.orderKey + "-" + index.toString(),
      children: (child !== undefined) ? child : undefined,      
    });
  }
  this.PTNTreeItems = some
  this.AnalogListState = false
  this.getCriteria()
  this.expandAll = true
}

async getSpecBranch(parentKey: any) {
  let response = await ordersController.GetOrdersSpec(0,parentKey)
  let result = this.preparedDataToTable(response)
  let some: any[] = []
  // переформируем под класс TreeChild
  result.valuesTable.forEach((elem:any,index:any) => {
    some.push({
      id: elem.fkey,
      name: (elem.fNumber !== undefined ? elem.fNumber + " " : "") + " " +elem.spWorksName,
      parentId: parentKey,
      index: index,
      number: parentKey + "-" + index.toString(),
      children: undefined,
      fTrud: elem.fTrud,
      haveDefaultTrud: elem.haveDefaultTrud,
    });
  });
  return some
}

  async getCriteria() {
    const result = await ordersController.getCriteria_Order(this.orderKey)
    this.selectedCriteria = this.preparedDataToTable(result).valuesTable
    this.selectedKeysCriteria = this.selectedCriteria.map((el)=>el.f_spCriteria)
    this.selectedComboBoxItems = this.selectedCriteria
  }

  async updateCardCriteria(item: any) {
    if (item !== undefined) {
      const keys = item.map((el:any)=>el.id).toString()
      //console.log("Case Criteria!", this.lastSpecKey, keys)
      await ordersController.modifyOrderCriteria(this.orderKey, keys.toString())
      this.getCriteria()
    }
  }

  async refreshAnalogList() {
    this.selectedKeysCriteria = this.selectedComboBoxItems.map((el)=>el.f_spCriteria)
    this.getAnalogList()

    //Сохраняем галки на ветке
    if (this.lastTreeBranch !== null) {
      if (this.lastTreeBranch !== undefined) {
        const founded = this.treeBranchCriteria.find((el:any) => el.id == this.lastTreeBranch.id)
        if (founded !== undefined) {
          founded.criteria = this.selectedKeysCriteria
        } else {
          this.treeBranchCriteria.push( { id: this.lastTreeBranch.id, criteria: this.selectedKeysCriteria } )
        }
        //console.log("treeBranchCriteria", this.treeBranchCriteria)
      }
    }
  }

  async getAnalogList () {
    if (this.lastTreeBranch !== undefined) {
      let result = await ordersController.getAnalogOpers(this.lastTreeBranch.id,this.selectedKeysCriteria.toString())
      let parsed = this.preparedDataToTable(result)
      this.dataAnalogList = parsed.valuesTable
      this.headersAnalogList = parsed.headersTable
      //Скрывем колонки с ключами критерий и их наименованиями
      this.hideColumns(this.headersAnalogList, ["critList","critKeys","fFullDescription"])
      //Заполняем эктремумы значений для отображения
      if (this.dataAnalogList.length > 0) {
        this.presentTrudValues.min = this.dataAnalogList.reduce((a,b)=>parseInt(a.fTrud)<parseInt(b.fTrud)?a:b).fTrud
        this.presentTrudValues.avg = parseFloat(this.dataAnalogList.map(function(x,i,arr){return x.fTrud/arr.length}).reduce(function(a,b){return a + b}).toFixed(2))
        this.presentTrudValues.max = this.dataAnalogList.reduce((a,b)=>parseInt(a.fTrud)>parseInt(b.fTrud)?a:b).fTrud
      }

      if (this.dataAnalogList.length > 0) {
        //группируем 
        const crit_grouped = this.dataAnalogList.reduce(function (r, a) {
            var key = a.critProc || 'others';
            r[key] = r[key] || [];
            r[key].push(a.fTrud);
            return r;
        }, Object.create(null))
        //Формируем итоговую таблицу
        this.proc_items = Object.keys(crit_grouped).map((key:any) => ({
                critProc: key,
                count: crit_grouped[key].length,
                max: crit_grouped[key].reduce((a:any,b:any)=>parseInt(a)>parseInt(b)?a:b),
                avg: parseFloat((crit_grouped[key].map(function(x:any,i:any,arr:any){return x/arr.length}).reduce(function(a:any,b:any){return a + b})).toFixed(3)),
                min: crit_grouped[key].reduce((a:any,b:any)=>parseInt(a)<parseInt(b)?a:b),
                //resProc: Math.round(parseFloat(key) * Math.log(crit_grouped[key].length+1)),
        }))
        //this.expanded = [this.proc_items.reduce((a,b)=>parseInt(a.resProc)>parseInt(b.resProc)?a:b)]
        this.expanded = [this.proc_items.reduce((a,b)=>parseInt(a.critProc)>parseInt(b.critProc)?a:b)]
      }
    }
  }

  async openCardCriteria() { //Здесь их получаешь
    await this.getCriteria()
    this.openCardCriteriaCard = !this.openCardCriteriaCard
  }

  async selectTreeBranch(item:any) {
    if (item !== this.lastTreeBranch && item !== undefined) {
      if (this.lastTreeBranchTrud !== this.lastTreeBranchTrud_old && this.lastTreeBranchTrud_old !== -1 ) {
        let isBoss = confirm("Трудоемкость на операции была изменена (" + this.lastTreeBranchTrud_old + " -> " + this.lastTreeBranchTrud + "). Сохранить новое значение в базе?");
        if (isBoss) {
          this.saveTrud(this.lastTreeBranch, this.lastTreeBranchTrud)
        }
      }
      //Если нет потомков значит это операция, ищем для нее аналог
      if (item.children === undefined) {

        //Восстанавливаем проставленные галки на комбобоксе
        const founded = this.treeBranchCriteria.find((el:any) => el.id == item.id)
        if (founded !== undefined) {
          this.selectedComboBoxItems = this.selectedCriteria.filter((el:any) => founded.criteria.includes(el.f_spCriteria))
        } else {
          this.selectedComboBoxItems = this.selectedCriteria
        }

        //ищем аналоги
        this.lastTreeBranch = item
        this.lastTreeBranchTrud = item.fTrud
        this.lastTreeBranchTrud_old = item.fTrud
        this.lastCriteriasList = []
        await this.getAnalogList()
        this.AnalogListState = true

        if (item.haveDefaultTrud > 0) {
          this.haveDefaultTrud = item.haveDefaultTrud
        } else { 
          this.haveDefaultTrud = 0
        }
      }
      else { this.AnalogListState = false }
    }
  }

  async saveTrud(item:any, fTrud:any) {
    let _fkey = this.lastTreeBranch.id
    let _fTrud = this.lastTreeBranchTrud
    if (fTrud !== undefined) { 
      item.fTrud = fTrud
      _fkey = item.id
      _fTrud = fTrud
    } else { 
      this.lastTreeBranch.fTrud = this.lastTreeBranchTrud 
    }
    //Обновляем в базе данных значение трудоемкости
    ordersController.saveOrderOperTrud(_fkey,_fTrud)

    //Сохряняем в базе данных текущие выбранные критерии на эту операцию
    await ordersController.updateCriteria_Order_Spec(this.lastTreeBranch.id,this.selectedKeysCriteria.toString())

    this.lastTreeBranchTrud_old = this.lastTreeBranchTrud
  }

  checkCriterialColor(item: any)
  {
    let ResColor = this.colorPassive
    if (this.lastCriteriasList != null) {
      if (this.lastCriteriasList.includes(item.f_spCriteria)) {
        ResColor = this.colorActive
      }
    }
    return ResColor
  }

  selectCritList (item:any) {
    this.selectedItem = item
    this.selectedField = "critList"
  }

  selectDesc (item:any) {
    this.selectedItem = item
    this.selectedField = "fFullDescription"
  }
  
  unSelectItem () {
     this.selectedItem = null
     this.lastCriteriasList = null
     this.selectedField = ""
  }

  analogListDblClick(event:any, item:any) {
    this.lastTreeBranchTrud = item.item.fTrud
  }

  procListDblClick(event:any, item:any)
  {
    this.lastTreeBranchTrud = item.item.avg
  }

  analogListClick(event:any, item:any) {
    this.lastCriteriasList = item.item.critKeys.split(",")
  }

  getColor (critProc: any) {
    if (critProc >= 80) return 'green'
    else if (critProc >= 50) return 'orange'
    else if (critProc >= 30) return 'red'
    else return 'grey'
  }

  getCritList(item: any): any {
    this.lastCriteriasList = item.critKeys.split(",")
    const critkeysList = this.selectedCriteria.map(el => el.fName)
    let result: any = undefined
    if (item != undefined) {
      result = item.critList.split(',').map((el:string)=> (
          {
            name:el,
            color: critkeysList.includes(el) ? this.colorActive : this.colorPassive,
          }
      ))
    }
    return result
  }

  getFullDesc(item: any): any {
    if (item != undefined)
    { return item.fFullDescription }
  }

  haveDefaultTrudClick(trud:any) {
    this.lastTreeBranchTrud = trud
  }

}
</script>

<style scoped>

</style>