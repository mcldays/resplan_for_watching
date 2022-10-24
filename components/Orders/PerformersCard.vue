<template>
  <div>
    <v-card>        
        <div style="position: sticky; top:0; z-index: 999;" class="grey lighten-3">
          <v-card-title>
            <v-icon class="mx-2">mdi-account-multiple-outline</v-icon>
            Список исполнителей
          </v-card-title>
          <v-divider/>
        </div>        
        <v-card-text>

          <v-btn @click="openProfessionList" block>
              <v-icon color="green" class="pa-2">mdi-plus-circle-outline</v-icon>
              Добавить исполнителя
          </v-btn>
          <v-divider vertical/>
          <v-container style="padding: 0px;"
            v-for="(field, key) in performersData"
            :key="key"
          >
            <v-row dense>
              <v-col cols="3" md="8">
                <div style="display: flex;">
                  <v-checkbox v-model="field.isChecked" dense/>
                  <v-text-field label="Профессия" v-model="field.spProfessionName" outlined disabled filled dense hide-details/>
                </div>
              </v-col>
              <v-col md="2" v-if="field.isChecked">
                <v-text-field 
                  label="Количество" 
                  v-model="field.fCount" 
                  type="number" 
                  :hint="'В штате: ' + ((field.fCountMax>0)?field.fCountMax:'нет')" 
                  persistent-hint 
                  outlined 
                  dense 
                  min="0"/>
              </v-col>
              <v-col md="2" v-if="field.isChecked">
                <v-text-field label="Причастность" v-model="field.fRatio" type="number" outlined dense hide-details min="0"/>
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
      v-model="selectProfState"
      width="auto"
      v-if="selectProfState"
    >
      <select-table
        :headers="this.headersForDialog"
        :table-data="this.dataForDialog"
        @chosenRow="addPerformer"
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
export default class PerformersCard extends mixins(tableMixin) {

@Prop() specKey: number

//Performers param
private performersDefaultData: any[] = []
private performersData : any[] = []
private performersHeaders : Header[] = []

//select prof
private selectProfState = false
private dataForDialog: any[] = []
private headersForDialog: any[] = []

async created() {
  await this.refreshPerformers()
}

closeCard() {
  this.$emit("closed")
}

async saveCard() {
  const applyTable:any = this.performersData.filter((el)=>el.isChecked).map((el)=>({
    fkey: el.fkey,
    fCount: el.fCount,
    fRatio: el.fRatio,
    f_spProfession: el.f_spProfession,
    f_boOrder_Spec: this.specKey,
  }))
  //передаем пустой элемент в базу в случаи если нет не одного элемента в списе, значит все остальные записи на этой операции надо удалить
  if (applyTable.length==0) applyTable.push(({fkey:-1,f_boOrder_Spec: this.specKey}))

  const insertResult = await baseController.applyOrderSpecPerformers(applyTable)

  this.$emit("needUpdateTable")
  this.closeCard()
}

async refreshPerformers() {
    //const result = await baseController.execReport(21, '{"f_boOrder_Spec":"' + this.specKey + '"}')
    const result = await baseController.getOrderSpecPerformers(this.specKey)
    let resultParsed = this.preparedDataToTable(result)
    this.performersData = resultParsed.valuesTable
    this.performersHeaders = resultParsed.headersTable
}

async openProfessionList()
  {
    this.selectProfState = !this.selectProfState
    let result = await baseController.getRelValue('spProfession', 0)
    let parsed = this.preparedDataToTable(result)
    this.dataForDialog = parsed.valuesTable
    this.headersForDialog = parsed.headersTable
  }

addPerformer (item: any) {
  this.selectProfState = !this.selectProfState
  this.performersData.push((
    {
      fkey: 0, 
      spProfessionName: item.fName,
      fCount: 1,
      fRatio: 1,
      f_spProfession: item.fkey,
      f_boOrder_Spec: this.specKey,
    }))
}

}
</script>

<style scoped>

</style>