<template>
  <div style="display:block">

    <!-- тест ганта -->
    <!--
    <ParamReference
      tableName="boOrders"
      :paramData="curOrder"
      :paramKey="92"
      :primaryKey="92"
    />
    <CanvasGantt
      :stepDataGant="this.DataGant"
      :canvasWidth="1800"
      :canvasHeight="800"
    />
    -->

    <CanvasDemo
      :canvasWidth="500"
      :canvasHeight="300"
    />

  </div>
</template>


<script lang="ts">
import {Component, Prop, Watch} from 'vue-property-decorator'
import {mixins} from "vue-class-component";
import {tableMixin} from "@/mixins/tableMixin";
import {baseController} from "@/controllers/baseController";
import moment from "moment";
import ParamReference from "@/ui/elements/ParamReference.vue";
import CanvasGantt from "@/ui/canvas/CanvasGantt.vue"
import CanvasDemo from "@/ui/canvas/CanvasDemo.vue"


@Component({
  components: { ParamReference, CanvasGantt, CanvasDemo }
})
export default class CanvasTestForm extends mixins(tableMixin) {

  //Order
  private curOrder: any = { key: { value:'boOrders', text:'Заказ' }, value: '92', valueID: '92' }

  //Data
  private DataGant: any[] = []

  async mounted() {
    await this.openGantStep()
  }

  @Watch('curOrder.valueID', {deep : true})
  async openNewOrder() {
    await this.openGantStep()
  }

  async openGantStep() {
    let result = await baseController.getReportGraf(this.curOrder.valueID,0)
    let resultParsed = this.preparedDataToTable(result)
    this.DataGant = resultParsed.valuesTable
  }

  
}
</script>

<style scoped>

</style>
