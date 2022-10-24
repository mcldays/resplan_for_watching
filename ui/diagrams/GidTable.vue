<template>
  <v-card elevation="10" outlined style="padding: 20px" shaped>
    <v-card-title>
      Контроль ГИД
    </v-card-title>
<v-data-table
    sort-by="deadline"
:headers="headers"
:items = "this.tableData"
>

  <template v-slot:body="{items}">
    <tbody>
    <tr
        v-for="(item,index) in items"
        :key="index"
        style="cursor: pointer"
        @dblclick = redirect(item)
    >
      <td v-for="(value,name,index1) in item"
          :key="index1"
          :style="colorTr(item)"
      >
        {{value}}
      </td>
    </tr>
    </tbody>
  </template>
</v-data-table>
  </v-card>
</template>

<script lang="ts">
import {Vue,Component, Prop} from 'vue-property-decorator'
import {ordersController} from "@/controllers/ordersController";
import {mixins} from "vue-class-component";
import {tableMixin} from "@/mixins/tableMixin";
@Component({
  name : "GidTable"
})

export default class GidTable extends mixins(tableMixin) {
  private tableData : any[] = []
  private headers: any[] = [
    {
      text: "Контроль - ГИД",
      value : "gidControl"
    },
    {
      text: "Дедлайн",
      value : "deadline"
    },
  ]
  colorTr(item :any) {

    let reverseDate = (item.deadline).split('.').reverse().join('.')
    let date1 = new Date(reverseDate)
    let dateWeek = new Date()
    let dateMonth = new Date()
    dateMonth.setMonth(dateMonth.getMonth() - 1)
    dateWeek.setDate(dateWeek.getDate() - 7)
    if (date1 >= dateWeek) {
      return "color: red"
    } else if (date1 >= dateMonth) {
      return "color : grey"
    } else return "color : none"
  }

  redirect(item :any){
    this.$router.push(`/orderbook/extended?stringId=${item.fkey}&reportId=11&tableName=boOrders`)
  }

  async mounted(){
    let result = await ordersController.GetAll();
    let prepared = this.preparedDataToTable(result)

    //console.log("prepared.valuesTable",prepared.valuesTable)
    let description = prepared.valuesTable.filter(function (e){
      if(e.fonGIDControl == 'True') {
        return e
      }
    })
    let data  = []
    for (const descriptionElement of description) {
      data.push({
        "gidControl" : descriptionElement.fDescription,
        "deadline" : descriptionElement.fDateFinish,
        "fkey" : descriptionElement.fkey
      })
    }
      this.tableData = data
  }

}
</script>

<style scoped>

</style>