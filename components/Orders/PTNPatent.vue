<template>
  <div>
    <MessageBox
      :v-model="MessageBoxState"
      title="Обновить все операции в списке доступных?"
      message="Хорошо подумайте прежде, чем сделать необдуманное действие!"
      @result="refreshAllOpers"
    />
    <v-card>
        <div style="position: sticky; top:0; z-index: 999;" class="grey lighten-3">
          <v-card-title>
            <v-icon class="mx-2">mdi-calculator</v-icon>
            Расчета трудозатрат на выполнение работ «Обзор научно-технической литературы и патентов»
          </v-card-title>
          <v-divider/>
        </div>
        <v-card-text>
          <div style="display:flex;width:100%;">
            <div style="width:50%;">
              <v-text-field
                label="Глубина поиска, лет"
                v-model="DS"
                hint = "Ks = 2"
                persistent-hint
                type="number"
                outlined
                class="pa-2"
                prepend-icon="mdi-numeric"
                min="0"
              />
              <v-text-field
                label="Доля информации на иностранном языке,  доли ед."
                v-model="VLang"
                hint = "KLang = 2"
                persistent-hint
                type="number"
                outlined
                class="pa-2"
                prepend-icon="mdi-numeric"
                min="0"
                max="1"
              />
            </div>
            <v-divider vertical style="margin:15px"/>
            <div style="width=50%;">
              <h4>По уровеню структурирования и автоматизации, шт.:</h4>
              <v-divider style="margin:15px"/>
              <v-text-field
                label="Нет структурирования и автоматизации (интернет, неотсортированные папки)"
                v-model="Ntr0"
                hint = "Ntr0 = 2"
                persistent-hint
                type="number"
                outlined
                class="pa-2"
                prepend-icon="mdi-numeric"
                min="0"
                dense
              />
              <v-text-field
                label="Низкий (сборник публикаций, учебников, монографий отсортированные по тематикам папки)"
                v-model="Ntr1"
                hint = "Ntr1 = 1"
                persistent-hint
                type="number"
                outlined
                class="pa-2"
                prepend-icon="mdi-numeric"
                min="0"
                dense
              />
              <v-text-field
                label="Средний (база ЛНД НК Роснефть)"
                v-model="Ntr2"
                hint = "Ntr2 = 0,5"
                persistent-hint
                type="number"
                outlined
                class="pa-2"
                prepend-icon="mdi-numeric"
                min="0"
                dense
              />
              <v-text-field
                label="Высокий (патентная база, onepetro.org)"
                v-model="Ntr3"
                hint = "Ntr3 = 0,25"
                persistent-hint
                type="number"
                outlined
                class="pa-2"
                prepend-icon="mdi-numeric"
                min="0"
                dense
              />
            </div>
          </div>

          <div style="display:flex">
            <v-btn @click="refreshTrud" width="70%">
                <v-icon color="green" class="pa-2">mdi-arrow-expand-down</v-icon>
                Пересчитать трудозатраты
            </v-btn>
            <v-divider style="margin:15px"/>
            <v-btn @click="showMessageBox" width="25%" color="yellow">
                <v-icon color="green" class="pa-2">mdi-refresh</v-icon>
                Обновить все операции
            </v-btn>
          </div>

          <v-divider style="margin:15px"/>
          <v-data-table
            :headers="headers"
            :items="items"
            class="elevation-1"
            disable-pagination
            disable-filtering
            disable-sort
            fixed-header
            hide-default-footer
            :expanded.sync="expanded"
            show-expand
            :single-expand="singleExpand"
            item-key="formulaKey"
          >
          <template v-slot:expanded-item="{ headers, item:itemParent }">
            <td :colspan="headers.length" class="pa-4">
              <v-card>
                <v-card-text>
                  <v-data-table
                    :headers="headersPatents"
                    :items="dataPatents.filter((el)=>el.f_spFormula == itemParent.formulaKey)"
                    disable-pagination
                    disable-filtering
                    disable-sort
                    fixed-header
                    hide-default-footer
                    hide-default-header
                  >
                    <template v-slot:no-data>
                      -- нет операций в заказе: {{itemParent.fWorkName}}  --
                      <v-btn @click="addOpersToOrder(itemParent)" block>
                          <v-icon color="green">mdi-plus</v-icon>
                          Добавить операцию в заказ
                      </v-btn>
                    </template>
                    <!-- eslint-disable-next-line -->
                    <template v-slot:item.buttonRefresh="{ item }">
                      <div style="display:flex">
                        <v-btn @click="undoTrudOnItem(item)" icon>
                            <v-icon color="red">mdi-arrow-u-left-top-bold</v-icon>
                        </v-btn>
                        <v-btn @click="refreshTrudOnItem(itemParent, item)" icon>
                            <v-icon color="green">mdi-refresh</v-icon>
                        </v-btn>
                        </div>
                    </template>
                  </v-data-table>
                </v-card-text>
              </v-card>
            </td>
          </template>
          </v-data-table>
        </v-card-text>

    </v-card>

    <div style="display: flex; position: sticky; bottom: 0; z-index: 999" class="pa-5 grey lighten-4">
      <v-btn depressed color="error" @click="closeCard">Отменить</v-btn>
      <v-spacer></v-spacer>
      <v-btn depressed color="primary" @click="saveCard">Сохранить</v-btn>
    </div>


  </div>
</template>

<script lang="ts">
import {Component, Prop} from 'vue-property-decorator'
import {baseController} from "@/controllers/baseController";
import {mixins} from "vue-class-component";
import {tableMixin} from "@/mixins/tableMixin";
import {ordersController} from "@/controllers/ordersController";
import MessageBox from '@/ui/MessageBox.vue'


@Component({
  components: { MessageBox }
})
export default class PTNPatent extends mixins(tableMixin) {

@Prop() orderKey: number

private expanded: any [] = []
private singleExpand = false
private headersPatents: any[] = []
private dataPatents: any[] = []
private MessageBoxState = false

//params
private DS = 30
private Ntr0 = 0
private Ntr1 = 1
private Ntr2 = 0
private Ntr3 = 2
private VLang = 0.5
private KLang = 2

private headers = [  
  { text: 'Наименование', value: 'fWorkName' },  
  { text: 'Расчетная формула', value: 'fFormula' },
  { text: 'Трудозатраты', value: 'fTrud' },
  { text: 'Есть в заказе', value: 'fCount' },
  { text: '', value: 'data-table-expand' },
]

private items = [
  { formulaKey: "1", fCount: 0, fWorkName: 'Сбор и анализ научно-технической информации по направлению выполняемого исследования', fTrud: 0, fFormula: 'Т1=200∙Ln(DS)∙(0,03∙∑(Nstri∙Autoi)+0,5∙(1+(KLang-1)∙VLang))'},
  { formulaKey: "2", fCount: 0, fWorkName: 'Оформление текста отчета', fTrud: 0, fFormula: 'T2=0,1∙T1'},
  { formulaKey: "3", fCount: 0, fWorkName: 'Сбор и анализ патентной информации', fTrud: 0, fFormula: 'Т1=35∙Ln(DS)'},
  { formulaKey: "4", fCount: 0, fWorkName: 'Составление отчета о патентных исследованиях', fTrud: 0, fFormula: 'T2=0,1∙T1'},
]

async created() {
  await this.refreshPatents()
  const existsKeys = this.dataPatents.map((el)=>el.f_spFormula)
  this.expanded = this.items.filter((el)=>existsKeys.includes(el.formulaKey))
  this.items.forEach((el)=>{
    el.fCount = existsKeys.filter((ee)=>ee==el.formulaKey).length
  })
  this.refreshTrud ()
}

async refreshPatents() {
  let result = await ordersController.getOperFormuls(this.orderKey)
  let dataTableParsed = this.preparedDataToTable(result)
  this.dataPatents = dataTableParsed.valuesTable
  this.headersPatents = dataTableParsed.headersTable
  this.hideColumns(this.headersPatents, ["fkey","f_spFormula","fTrudOld"])
  this.headersPatents.push({value: "buttonRefresh", text: "buttonRefresh"})
}

refreshTrud () {
  const sumNtr = this.Ntr0 * 2 + this.Ntr1 * 1 + this.Ntr2 * 0.5 + this.Ntr3 * 0.25
  this.items[0].fTrud = Math.round(200 * Math.log(this.DS) * (0.03 * sumNtr + 0.5 * (1 + (this.KLang - 1) * this.VLang)))
  this.items[1].fTrud = Math.round(this.items[0].fTrud * 0.1)
  this.items[2].fTrud = Math.round(35 * Math.log(this.DS))
  this.items[3].fTrud = Math.round(this.items[2].fTrud * 0.1)
}

closeCard() {
  this.$emit("closed")
}

async saveCard() {
  const saveData = this.dataPatents.map((el)=> ({
    f_boOrders: this.orderKey,
    fkey: el.fkey,
    fTrud: el.fTrud,
    f_spFormula: el.f_spFormula,
  }))
  await ordersController.modifyPatentOpers(saveData)
  this.$emit("needUpdateTable")
  this.closeCard()
}

addOpersToOrder(item: any) {
  this.dataPatents.push({
    fkey: "",
    fNumber: "--//--",
    fCode: "--//--",
    fName: item.fWorkName,
    fTrud: item.fTrud,
    f_spFormula: item.formulaKey,
  })
  item.fCount++
}

refreshTrudOnItem(fromItem: any, toItem: any) {
  toItem.fTrud = fromItem.fTrud
}

undoTrudOnItem(item: any) {
  item.fTrud = item.fTrudOld
}

showMessageBox() {
  this.MessageBoxState = !this.MessageBoxState
}

refreshAllOpers() {
  this.MessageBoxState = !this.MessageBoxState
  this.dataPatents.forEach((parent) => {
    parent.fTrud = this.items.find((el)=>el.formulaKey == parent.f_spFormula)?.fTrud
  })
}

}
</script>

<style scoped>

</style>