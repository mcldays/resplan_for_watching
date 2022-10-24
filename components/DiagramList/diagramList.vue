<template>
<div>
  <div style="display:flex; padding: 0px 10px 10px 10px;">
    <div class="doughnut">
      <v-card elevation="10" height="400px" outlined style="padding: 10px" shaped>
        <v-card-title class="justify-center"> Всего проектов {{totalProjects}} </v-card-title>
        <v-card-text>
          <doughnut-template
            :chartData="this.chartDataDef"
          />
        </v-card-text>
      </v-card>
    </div>

    <v-card elevation="10" outlined style="padding: 5px; margin-left: 40px" height="400px" shaped>
    <bar-template 
      :chartData="chartDataDefBar"
      :width="1100"
      :height="300"
    />
    </v-card>
  </div>
  <div style="display:flex;">
    
  <div class="ma-5">
    <gid-table/>
  </div>

  <div class="ma-5">
    <BaseTable
        table-name="Портфели КНИПИ"
        :table-data="this.dataCompanyList"
        :headers="this.headersCompanyList"
        :itemsPerPage="15"
      />
  </div>

  <!--
  <div style="width: 50%; padding: 0 50px 50px 50px;" >
    <v-card  elevation="10" outlined style="padding: 20px" shaped>
    <bubble-template :key="keyBubble" ref="bubble" :height="400" :width="400" :chart-data="this.bubbleData"/>
    </v-card>
  </div>
  -->
  </div>
<!--  <line-template/>-->
</div>
</template>

<script lang="ts">
import {Component, Prop, Vue, Watch} from "vue-property-decorator";
import doughnutTemplate from "@/ui/diagrams/dougnutTemplate.vue";
import barTemplate from "@/ui/diagrams/barTemplate.vue";
import lineTemplate from "@/ui/diagrams/lineTemplate.vue";
import {baseController} from "@/controllers/baseController";
import {mixins} from "vue-class-component";
import {tableMixin} from "@/mixins/tableMixin";
import GidTable from "@/ui/diagrams/GidTable.vue";
import BubbleTemplate from "@/ui/diagrams/bubbleTemplate.vue";
import {ordersController} from "@/controllers/ordersController";
import BaseTable from "@/ui/BaseTable.vue";


@Component({
  components:{
    doughnutTemplate,
    barTemplate,
    lineTemplate,
    GidTable,
    BubbleTemplate,
    BaseTable
  },
})
export default class diagramList extends mixins(tableMixin) {
  private chartDataDef = {}
  private chartDataDefBar = {}
  private chartDataBubble = {}
  private totalProjects = 0
  private doughnutData : any[] = []
  private bubbleData  = {} as any
  private keyBubble = 0

  private dataCompanyList: any[] = []
  private headersCompanyList: any[] = []


  async mounted() {
    //Данные для круговой диаграммы
    await this.prepareDataForDoughnut()
    //данные для палочной гистограммы
    await this.prepareDataForBar()
    //данные для пузырьковой диаграммы
    //await this.prepareDataForBubble()
    //this.keyBubble++
    await this.prepareDataForCompanyList()
  }

  async prepareDataForCompanyList() {
    const result = await baseController.execReport(31, 'none')
    let dataTableParsed = this.preparedDataToTable(result)
    this.dataCompanyList = dataTableParsed.valuesTable
    this.headersCompanyList = dataTableParsed.headersTable
  }

  async prepareDataForDoughnut(){
    const result = await baseController.execReport(12, "none")
    const resultParsed = this.preparedDataToTable(result)
    this.doughnutData = this.deepClone(resultParsed.valuesTable)
    this.chartDataDef = {
      labels: resultParsed.valuesTable.map( (el) => el.fName ),
      datasets: [
        {
          backgroundColor: resultParsed.valuesTable.map( (el) => '#'+(0x1000000+Math.random()*0xffffff).toString(16).substr(1,6) ),
          data: resultParsed.valuesTable.map( (el) => el.fCount )
        }
      ]
    }
    for (const resultElement of resultParsed.valuesTable) {
      this.totalProjects+= Number(resultElement.fCount)
    }
  }

  async prepareDataForBar(){
    const resultBar = await baseController.execReport(13, "none")
    const resultParsedBar = this.preparedDataToTable(resultBar)
    const companies = [ ...new Set( resultParsedBar.valuesTable.map((el) => el.fCompany)) ]
    const charts = [ ...new Set( resultParsedBar.valuesTable.map((el) => el.fStatus)) ]
    const colors = [ ...new Set( resultParsedBar.valuesTable.map((el) => el.fStatusColor)) ]
    const charts_colored = charts.map((el,index) => ({fStatus:el, fStatusColor:colors[index]}))

    const dataset1 = charts_colored.map((el) => ({
      stack: el.fStatus,
      label: el.fStatus,
      backgroundColor: el.fStatusColor,
      data: resultParsedBar.valuesTable.filter((elpp) => elpp.fStatus === el.fStatus).map((elpp) => elpp.fCount)
    }) )

    this.chartDataDefBar = {
      labels: companies,
      datasets: dataset1
    }
  }

  async prepareDataForBubble(){
    const dataBubble = []
    for (const datum of this.doughnutData) {
      dataBubble.push({
        label : datum.fName,
        backgroundColor: '#'+(0x1000000+Math.random()*0xffffff).toString(16).substr(1,6),
        data : [
          {
            x : this.getRandomIntInclusive(0,5),
            y: this.getRandomIntInclusive(0,5),
            r: datum.fCount * 3
          }
        ]

      })
    }
    this.bubbleData.datasets = dataBubble
  }

  $refs!: {
    bubble: HTMLInputElement
  }

   getRandomIntInclusive(min : number, max : number) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min; //Максимум и минимум включаются
  }
}
</script>

<style scoped>

</style>