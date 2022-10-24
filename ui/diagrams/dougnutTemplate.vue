<template>
  <div>
    <Doughnut
        :chart-options="chartOptions"
        :chart-data="chartData"
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
import { Doughnut } from 'vue-chartjs/legacy'

import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  CategoryScale
} from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale)
@Component({
  components:{
    Doughnut
  },
})
export default class doughnutTemplate extends Vue{
@Prop({default : 'bar-chart'}) chartId : string
@Prop() datasetIdKey : string
@Prop({default : 400}) width : string
@Prop({default : 300}) height : string
@Prop({default : ''}) cssClasses : string
@Prop({default : ()=>[]}) chartData : any[]

  chartOptions =  {
    responsive: true,
    maintainAspectRatio: false
  }

}

</script>

<style scoped>

</style>