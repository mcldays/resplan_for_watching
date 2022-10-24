<template>
  <div>
    <Bar
      :chart-options="chartOptions"
      :chart-data="this.chartData===undefined? this.chartDataDef: this.chartData"
      :chart-id="chartId"
      :dataset-id-key="datasetIdKey"
      :css-classes="cssClasses"
      :width="width"
      :height="height"
    />
  </div>
</template>

<script lang="ts">
import {Component, Prop, Vue, Watch} from "vue-property-decorator";
import { Bar } from 'vue-chartjs/legacy'

import {
  Chart as ChartJS,
      Title,
      Tooltip,
      Legend,
      BarElement,
      CategoryScale,
      LinearScale
} from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)
@Component({
  components:{
    Bar
  },
})
export default class barTemplate extends Vue{
  @Prop({default : 'bar-chart'}) chartId : string
  @Prop() datasetIdKey : string
  @Prop({default : 400}) width : string
  @Prop({default : 400}) height : string
  @Prop({default : ''}) cssClasses : string
  @Prop({default : ()=>[]}) chartData : any[]

  chartOptions =  {
    responsive: true,
    maintainAspectRatio: false,
    interaction : {
      intersect : false
    },
    scales: {
      yAxes: {
        stacked: true,
      },
      xAxes: {
        stacked: true
      }
    },
    onClick(e:any,a:any,b:any) {
      console.log("e",e)
      console.log("a",a)
      console.log("b",b)
    }
  }

}

</script>

<style scoped>

</style>