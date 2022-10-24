<template>
  <div>
    <v-card>
      <div style="display:flex;" >
        <v-card-title>
          <v-icon class="mx-2">mdi-sitemap-outline</v-icon>
          Дополнительные расходы 
          {{ ' : ' + this.spendFull.toString().replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, '$1 ') }}
        </v-card-title>
        <v-spacer/>
        <v-btn class="ma-2" right x-large color="red" @click="saveCard" icon><v-icon class="mx-2">mdi-close-outline</v-icon></v-btn>
      </div>
      <v-card-text>
        <v-tabs center-active>
          <v-tab v-for="(tab,key) in this.tabNames" :key="key" @click="openTab(tab)">
            <v-icon class="mx-2">{{tab.icon}} </v-icon>
            {{ tab.fDesc }}
            {{ ' : ' + (tab.fValue===undefined?'':tab.fValue.replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, '$1 ')) }}
          </v-tab>
        </v-tabs>
        
        <!-- 1 Материалы -->
        <div v-if="curentTab===0" style="display:flex;" class="ma-2">
          <BaseTable
            :table-data="this.spendDataMat1"
            :headers="this.spendHeadersMat1"
            :toolbar-vision="true"
            table-name="Тип МТР"
            :control-button-vision="true"
            @needUpdateTable="preparedDataForTab(0)"
            :itemsPerPage="15"
            :defaultData="DefaultData"
            :canCopyRows="true"
            :canFiltered="false"
          />
          <v-divider style="margin:10px;height:0px" vertical/>
          <BaseTable
            :table-data="this.spendDataMat2"
            :headers="this.spendHeadersMat2"
            :toolbar-vision="true"
            table-name="Материал"
            :control-button-vision="true"
            @needUpdateTable="preparedDataForTab(0)"
            :itemsPerPage="15"
            :defaultData="DefaultData"
            :canCopyRows="true"
            :canFiltered="false"
          />
        </div>

        <!-- 2 Командировки -->
        <div v-if="curentTab===1" style="display:flex;" class="ma-2">
          <BaseTable
            :table-data="this.spendDataTravel"
            :headers="this.spendHeadersTravel"
            :toolbar-vision="true"
            table-name="Командировки"
            :control-button-vision="true"
            @needUpdateTable="preparedDataForTab(1)"
            :itemsPerPage="15"
            :defaultData="DefaultData"
            :canCopyRows="true"
            :canFiltered="false"
          />
        </div>

        <!-- 3 Субподряды -->
        <div v-if="curentTab===2" style="display:flex;" class="ma-2">
          <BaseTable
            :table-data="this.spendDataSubWorks"
            :headers="this.spendHeadersSubWorks"
            :toolbar-vision="true"
            table-name="Субподряды"
            :control-button-vision="true"
            @needUpdateTable="preparedDataForTab(2)"
            :itemsPerPage="15"
            :defaultData="DefaultData"
            :canCopyRows="true"
            :canFiltered="false"
          />
        </div>

        <!-- 4 Лабораторные исследования -->
        <div v-if="curentTab===3" style="display:flex;" class="ma-2">
          <div v-if="this.spendDataLab.length > 0">
            <BaseTable
              :table-data="this.spendDataLab"
              :headers="this.spendHeadersLab"
              table-name="Лабораторные исследования"
              :control-button-vision="true"
              @needUpdateTable="preparedDataForTab(3)"
              :itemsPerPage="15"
              :canFiltered="false"
            />
          </div>
          <div v-else>
            <v-alert class="ma-10" type="info" icon="mdi-cloud-alert" prominent outlined>
              Нет лабораторных исследований в этом <strong>Этапе</strong>
            </v-alert>
          </div>
        </div>

      </v-card-text>
    </v-card>
  </div>
</template>

<script lang="ts">
import {Component, Prop} from 'vue-property-decorator'
import BaseTable from "@/ui/BaseTable.vue";
import {baseController} from "@/controllers/baseController";
import {Header} from "@/models/TableDataModel";
import {mixins} from "vue-class-component";
import {tableMixin} from "@/mixins/tableMixin";

@Component({
  components: {BaseTable}
})
export default class SpendsCard extends mixins(tableMixin) {

@Prop() stepKey: number

private DefaultData: any
private curentTab = 0
private spendFull = 0

private spendDataMat1 : any[] = []
private spendDataMat2 : any[] = []
private spendHeadersMat1 : Header[] = []
private spendHeadersMat2 : Header[] = []

private spendDataTravel : any[] = []
private spendHeadersTravel : Header[] = []

private spendDataSubWorks : any[] = []
private spendHeadersSubWorks : Header[] = []

private spendDataLab : any[] = []
private spendHeadersLab : Header[] = []

private tabNames : any[] = [
  {ID: 0, fDesc: "Материалы", icon:"mdi-cart-variant"},
  {ID: 1, fDesc: "Командировки", icon:"mdi-train-car"},
  {ID: 2, fDesc: "Субподряды", icon:"mdi-account-hard-hat-outline"},
  {ID: 3, fDesc: "Лаб. исследования", icon:"mdi-bottle-tonic-skull-outline"},
]

async created() {
  this.DefaultData = [{key: 'f_boOrder_Step', value: this.stepKey}]
  this.preparedDataForTab(0)
}

async prepareSpendsSummary() {
  const result = await baseController.getSpends(this.stepKey)
  let resultParsed = this.preparedDataToTable(result).valuesTable
  this.spendFull = 0
  for(var i = 0; i < this.tabNames.length; i++) {
    this.tabNames[i].fValue = resultParsed[i].fValue
    this.spendFull += parseInt(resultParsed[i].fValue)
  }
}

async preparedDataForTab(tabID: any) {
  if (tabID === 0) {
    //type
    let result = await baseController.getSpendMatType_new(this.stepKey)
    let resultParsed = this.preparedDataToTable(result)
    this.spendDataMat1 = resultParsed.valuesTable
    this.spendHeadersMat1 = resultParsed.headersTable
    //mat
    result = await baseController.getSpendMatNom(this.stepKey)
    resultParsed = this.preparedDataToTable(result)
    this.spendDataMat2 = resultParsed.valuesTable
    this.spendHeadersMat2 = resultParsed.headersTable
  } else { 
    if (tabID === 1) {
      const result = await baseController.getSpendTravel(this.stepKey)
      let resultParsed = this.preparedDataToTable(result)
      this.spendDataTravel = resultParsed.valuesTable
      this.spendHeadersTravel = resultParsed.headersTable
    } else {
      if (tabID === 2) {
        const result = await baseController.getSpendSubWorks(this.stepKey)
        let resultParsed = this.preparedDataToTable(result)
        this.spendDataSubWorks = resultParsed.valuesTable
        this.spendHeadersSubWorks = resultParsed.headersTable
      } else {
        if (tabID === 3) {
          const result = await baseController.getSpendLab(this.stepKey)
          let resultParsed = this.preparedDataToTable(result)
          this.spendDataLab = resultParsed.valuesTable
          this.spendHeadersLab = resultParsed.headersTable
      }
      }
    }
  }
  this.prepareSpendsSummary()
}

async openTab(tab: any) {
  this.curentTab = tab.ID
  await this.preparedDataForTab(tab.ID)
}

closeCard() {
  this.$emit("closed")
}

async saveCard() {

  this.$emit("needUpdateTable")
  this.closeCard()
}


}
</script>

<style scoped>

</style>