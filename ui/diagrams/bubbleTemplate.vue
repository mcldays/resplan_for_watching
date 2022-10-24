<template>
  <div>
    <Bubble
        :chart-data="localData"
        :chart-id="chartId"
        :chart-options="chartOptions"
        :css-classes="cssClasses"
        :dataset-id-key="datasetIdKey"
        :height="height"
        :plugins="plugins"
        :styles="styles"
        :width="width"
    />
  </div>
</template>

<script lang="ts">
import {Component, Prop, Vue, Watch} from 'vue-property-decorator'

import {Bubble} from 'vue-chartjs/legacy'

import {Chart as ChartJS, Legend, LinearScale, PointElement, Title, Tooltip} from 'chart.js'
import {mixins} from "vue-class-component";
import {tableMixin} from "@/mixins/tableMixin";

ChartJS.register(Title, Tooltip, Legend, PointElement, LinearScale)
@Component({
  name: "bubbleTemplate",
  components: {
    Bubble
  }
})

export default class BubbleTemplate extends mixins(tableMixin) {
  @Prop({default: "bubble"}) chartId: string
  @Prop({default: 400}) width: number
  @Prop({default: 400}) height: number
  @Prop({default: ''}) cssClasses: string
  @Prop() styles: any
  @Prop({default: () => []}) plugins: any
  @Prop({default: 'label'}) datasetIdKey: string
  @Prop({default : ()=> []}) chartData : any
  private localData : any = {}

  @Watch('chartData', {deep:true, immediate : true})
  mountView(){
    this.localData = this.deepClone(this.chartData)
    console.log(this.chartData)
  }

  public chartDataa = {
    datasets: [
      {
        label: 'Data One',
        backgroundColor: '#f87979',
        data: [
          {
            x: 20,
            y: 25,
            r: 5
          },
          {
            x: 40,
            y: 10,
            r: 10
          },
          {
            x: 30,
            y: 22,
            r: 30
          }
        ]
      },
      {
        label: 'Data Two',
        backgroundColor: '#7C8CF8',
        data: [
          {
            x: 10,
            y: 30,
            r: 15
          },
          {
            x: 20,
            y: 20,
            r: 10
          },
          {
            x: 15,
            y: 8,
            r: 30
          }
        ]
      }
    ]
  }

  public chartOptions = {
    responsive: true,
    maintainAspectRatio: false
  }

}
</script>

<style scoped>

</style>