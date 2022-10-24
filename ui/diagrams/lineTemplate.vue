<template>
  <div>
    <LineChartGenerator
        :chart-options="chartOptions"
        :chart-data="this.chartData"
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
import { Line as LineChartGenerator } from 'vue-chartjs/legacy'

import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  LinearScale,
  CategoryScale,
  PointElement,
  Filler
} from 'chart.js'

ChartJS.register(
    Title,
    Tooltip,
    Legend,
    LineElement,
    LinearScale,
    CategoryScale,
    PointElement,
    Filler
)
@Component({
  components:{
    LineChartGenerator
  },
})
export default class lineTemplate extends Vue{
  @Prop({default : 'bar-chart'}) chartId : string
  @Prop() datasetIdKey : string
  @Prop({default : 400}) width : string
  @Prop({default : 400}) height : string
  @Prop({default : ''}) cssClasses : string
  @Prop({default : ()=>[]}) chartData : any[]

  chartDataDef =  {
    labels: [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July'
    ],
    datasets: [
      {
        label: 'Data One',
        backgroundColor: '#f87979',
        data: [40, 39, 10, 40, 39, 80, 40]
      }
    ]
  }

  chartOptions =  {
    responsive: true,
    maintainAspectRatio: false
  }

}

</script>

<style scoped>

</style>