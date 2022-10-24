<template>
  <div class="mainContain">

    <notification-hub
      :isChips="true"
      :text="notifyTextGen()"
      :state="selectedItem ? true : false"
      :timeout="-1"
      backgroundColor="white"
    />

    <div style="display:flex">
      <v-chip outlined label class="my-2" text-color="blue">
        <strong>Год</strong>
        <v-divider vertical  class="mx-4"/>
        <v-autocomplete
          v-model="curentYear"
          :items="allYears"
          hide-details
          dense
          @change="changeYear"
        />
      </v-chip>
      <v-checkbox v-model="isSparks" label="Детализация с графиками" dense hide-details class="mx-2" @change="change_isSparks"/>
      <v-checkbox v-model="sparklineType" label="Гистограммы" dense hide-details class="mx-2"/>
      <v-checkbox v-if="!sparklineType" v-model="sparklineFill" label="Залить" dense hide-details class="mx-2"/>
    </div>

    <v-data-table
      :items="dataPlan"
      :headers="headersPlan"
      :items-per-page="15"
      :loading="isLoading"
      class="elevation-5"
      @click:row="clickRow"
      @dblclick:row="dbclickRow"
    />

    <!-- простой вариант -->
    <v-data-table
      v-if="selectedRow && !isSparks"
      :items="dataProfs"
      :headers="headersProfs"
      :items-per-page="15"
      :loading="isLoadingProfs"
      class="my-5 elevation-5"
      @dblclick:row="dbclickRow"
    />

    <!--Вариант с диграммой -->
    <v-data-table
      v-if="selectedRow && isSparks"
      :items="dataProfs"
      :headers="headersProfs"
      :items-per-page="15"
      :loading="isLoadingProfs"
      class="my-5 elevation-5"
    >
      <template v-slot:body="{items}">
        <tbody>
        <tr
          v-for="(item,index) in items"
          :key="index"
        >
          <td v-for="(value,name,index1) in item"
            :key="index1"
          >
            <!-- Диаграмма -->
            <div v-if="name == 'fSparkMon'" style="width:500px;height:250px">
              <v-sparkline
                :value="(/*'100,' + */value).split(',').map((el) => parseInt(el))"
                stroke-linecap="round"
                smooth
                :line-width="sparklineType?'18':'2'"
                :gradient="['#f72047', '#ffd200', '#1feaea']"
                :fill="sparklineFill"
                height="125"
                :type="sparklineType?'bar':'trend'"
              >
                <template v-slot:label="item">
                  {{ (/*item.index==0?'Норма':*/item.value + '%') }}
                </template>
              </v-sparkline>
            </div>
            <!-- Все остальное -->
            <div v-else>
              {{ value }}
            </div>
          </td>
        </tr>
        </tbody>
      </template>
    </v-data-table>

    <v-snackbar
      v-model="sparkState"
      timeout="-1"
      color="white"
      min-width="500px"
      right
    >
        <v-btn text @click="sparkClose" icon>
          <v-icon color="red">mdi-close</v-icon>
        </v-btn>
        <strong class="black--text">Загрузка подразделения</strong>
      <v-card light>
        <v-sparkline
          :value="sparkItems"
          padding="16"
          stroke-linecap="round"
          smooth
          :line-width="sparklineType?'18':'2'"
          :gradient="['#f72047', '#ffd200', '#1feaea']"
          :fill="sparklineFill"
          :type="sparklineType?'bar':'trend'"
          height="200"
        >
          <template v-slot:label="item">
            {{ item.value }}%
          </template>
        </v-sparkline>
      </v-card>
    </v-snackbar>
  
  </div>
</template>

<script lang="ts">
import {Component, Prop, Watch} from "vue-property-decorator";
import {mixins} from "vue-class-component";
import {tableMixin} from "@/mixins/tableMixin";
import {ordersController} from "@/controllers/ordersController";
import {baseController} from "@/controllers/baseController";
import moment from 'moment';
import MessageBox from "@/ui/MessageBox.vue";
import NotificationHub from "@/views/NotificationHub.vue"
import eventBus from "@/eventBus";
import lineTemplate from "@/ui/diagrams/lineTemplate.vue";
import { companiesController } from "@/controllers/companiesController";

@Component({
  components: {MessageBox, NotificationHub, lineTemplate}
})
export default class BalanceVersion2 extends mixins(tableMixin) {

  //Global varibles
  @Prop() selectedCompany:any

  //base params
  private selectedItem: any = null
  private curentYear = new Date().getFullYear()
  private allYears: number[] = []

  //first list
  private dataPlan: any[] = [{fname: "Загрузка..."}]
  private headersPlan: any[] = [{ text: 'Ждите', value: 'fname' }, ]
  private isLoading = true
  private selectedRow: any = null

  //second list
  private dataProfs: any[] = [{fname: "Загрузка..."}]
  private headersProfs: any[] = [{ text: 'Ждите', value: 'fname' }, ]
  private isLoadingProfs = true
  

  private sparkItems: any = []
  private sparkState = false
  private sparklineType = true
  private isSparks = true
  private sparklineFill = true

  async created() {
    this.preparedDataPlan()
    for (let i = this.curentYear-10; i < this.curentYear+10; i++) {
      this.allYears.push(i)
    }
  }

  @Watch("selectedCompany", {deep: true})
  async preparedDataPlan() {
    this.isLoading = true
    const result = await baseController.execReport(32, '{"f_spCompany":"' + this.selectedCompany + '","fYear":"' + this.curentYear + '"}')
    let dataTableParsed = this.preparedDataToTable(result)
    this.dataPlan = dataTableParsed.valuesTable
    this.headersPlan = dataTableParsed.headersTable
    this.hideColumns(this.headersPlan, ["fStatusColor","f_spPodr_performer"])
    this.isLoading = false
  }

  async preparedDataProfs() {
    if (this.selectedRow !== null) {
      this.isLoadingProfs = true
      const result = await baseController.execReport(
        this.isSparks ? 34 : 33,
        '{"f_spCompany":"' + this.selectedCompany + '","fYear":"' + this.curentYear + '","f_spPodr":"' + this.selectedRow.f_spPodr_performer + '"}')
      let dataTableParsed = this.preparedDataToTable(result)
      this.dataProfs = dataTableParsed.valuesTable
      this.headersProfs = dataTableParsed.headersTable
      this.hideColumns(this.headersProfs, ["fStatusColor","f_spProfession"])
      this.isLoadingProfs = false
    }
  }

  notifyTextGen() {
    return "Notify text"
  }

  changeYear() {
    this.preparedDataPlan()
  }

  clickRow(item:any) {
    if (this.selectedRow !== item) {
      this.selectedRow = item
      this.preparedDataProfs()
    }
  }

  dbclickRow(event:any, item:any) {
    this.sparkItems = []
    for (let i = 1; i <= 12; i++) {
      this.sparkItems.push(parseInt(item.item["mon"+i] == "" ? "0" : item.item["mon"+i]))
    }
    this.sparkState = true
  }

  sparkClose() {
    this.sparkState = false
  }

  change_isSparks() {
    this.dataProfs = [{fname: "Загрузка..."}]
    this.headersProfs = [{ text: 'Ждите', value: 'fname' }, ]
    this.preparedDataProfs()
  }

}

</script>

<style scoped>

</style>