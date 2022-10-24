<template>
  <div>
    <v-card>
      <div style="position: sticky; top:0; z-index: 999;" class="grey lighten-3">
        <v-card-title>Расходы по типу</v-card-title>
        <v-divider/>
      </div> 
      <v-card-text>

          <v-btn @click="openProfessionList" block>
              <v-icon color="green">mdi-plus-circle-outline</v-icon>
              Добавить тип расходов
          </v-btn>

          <v-divider vertical/>
          <v-container style="padding: 0px;"
            v-for="(field, key) in spendData"
            :key="key"
          >
            <v-row dense>
              <v-col cols="3" md="8">
                <div style="display: flex;">
                  <v-checkbox v-model="field.isChecked" dense/>
                  <v-text-field v-model="field.nbMatTypeName" outlined disabled filled dense hide-details/>
                </div>
              </v-col>
              <v-col md="4" v-if="field.isChecked">
                <v-text-field 
                  label="Стоимость" 
                  v-model="field.fValue" 
                  type="number" 
                  persistent-hint 
                  outlined 
                  dense 
                  min="0"/>
              </v-col>
            </v-row>
          </v-container>

      </v-card-text>
    </v-card>

    <div style="display: flex; position: sticky; bottom: 0; z-index: 999" class="pa-5 grey lighten-4">
      <v-btn depressed color="error" @click="closeCard">Отменить</v-btn>
      <v-spacer></v-spacer>
      <v-btn depressed color="primary" @click="saveCard">Сохранить</v-btn>
    </div>

    <v-dialog
      v-model="selectSpendType"
      width="auto"
      v-if="selectSpendType"
    >
      <select-table
        :headers="this.headersForDialog"
        :table-data="this.dataForDialog"
        @chosenRow="addSpendType"
      />
    </v-dialog>

  </div>
</template>

<script lang="ts">
import {Component, Prop} from 'vue-property-decorator'
import BaseTable from "@/ui/BaseTable.vue";
import {baseController} from "@/controllers/baseController";
import {Header} from "@/models/TableDataModel";
import {mixins} from "vue-class-component";
import {tableMixin} from "@/mixins/tableMixin";
import SelectTable from "@/ui/SelectTable.vue";

@Component({
  components: {BaseTable, SelectTable}
})
export default class OrderStepSpendCard extends mixins(tableMixin) {

@Prop() stepKey: number

//Spend param
private spendData : any[] = []
private spendHeaders : Header[] = []

//select spend type
private selectSpendType = false
private dataForDialog: any[] = []
private headersForDialog: any[] = []

async created() {
  await this.refreshData()
}

closeCard() {
  this.$emit("closed")
}

async saveCard() {
  const applyTable:any = this.spendData.filter((el)=>el.isChecked).map((el)=>({
    fkey: el.fkey,
    fValue: el.fValue,
    f_nbMatType: el.f_nbMatType,
    f_boOrder_Step: this.stepKey,
  }))
  //передаем пустой элемент в базу в случаи если нет не одного элемента в списе, значит все остальные записи на этой операции надо удалить
  if (applyTable.length==0) applyTable.push(({fkey:-1,f_boOrder_Step: this.stepKey}))

  const insertResult = await baseController.applyOrderStepSpend(applyTable)

  this.$emit("needUpdateTable")
  this.closeCard()
}

async refreshData() {
    const result = await baseController.getOrderStepSpend(this.stepKey)
    let resultParsed = this.preparedDataToTable(result)
    this.spendData = resultParsed.valuesTable
    this.spendHeaders = resultParsed.headersTable
}

async openProfessionList()
  {
    this.selectSpendType = !this.selectSpendType
    let result = await baseController.getRelValue('nbMatType', 0)
    let parsed = this.preparedDataToTable(result)
    this.dataForDialog = parsed.valuesTable
    this.headersForDialog = parsed.headersTable
  }

addSpendType (item: any) {
  this.selectSpendType = !this.selectSpendType
  this.spendData.push((
    {
      fkey: 0, 
      nbMatTypeName: item.fName,
      fValue: 0,
      f_nbMatType: item.fkey,
      f_boOrder_Step: this.stepKey,
    }))
}

}
</script>

<style scoped>

</style>