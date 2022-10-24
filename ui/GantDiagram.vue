<template>
  <v-card style="height: 100%">
    <v-card-title>
      <v-chip outlined class="mx-3"> {{titleStr.length > 150 ? titleStr.substring(0, 150) + '...' :  titleStr }} </v-chip>
      <v-checkbox v-model="showStepLoc" hide-details dense class="mx-2" label="Показывать этапы" @click="clickCBOpers"/>
      <v-checkbox v-model="showOpersLoc" hide-details dense class="mx-2" label="Показывать операций" @click="clickCBOpers"/>
      <v-spacer/>
      <v-btn icon @click="closeGant">
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </v-card-title>

    <v-toolbar v-if="ganttType" dense elevation="0">
      <div v-if="mode=='days'">
      <v-btn icon @click="goBack" >
        <v-icon>mdi-arrow-left-thick</v-icon>
      </v-btn>
        <span>{{this.currentMonth}}</span>
      </div>
      <v-spacer></v-spacer>

      <v-btn icon @click="nextPage">
        <v-icon>mdi-arrow-left-thick</v-icon>
      </v-btn>

      <v-btn icon @click="prevPage">
        <v-icon>mdi-arrow-right-thick</v-icon>
      </v-btn>
      <ButtonGroup
          group-name="Сортировка"
          :buttons="sortButtons"
          @yearSort="yearSort"
      />
    </v-toolbar>
    <div class="main">
      
      <!-- Гант на элементах -->
      <div v-if="ganttType">
        <GantParital
          v-if="gantState"
          :steps="steps"
          :rows="rows"
          :months-data="monthsData"
          :key="keyHack"
          :gant-mode="mode"
          :chart-values-li="chartValuesLi"
          :current-month="currentMonth"
          @snackIn="snackbarShow"
          @snackOut="snackbarOut"
          @openDay="openDays"
        />
      </div>

      <!-- Гант на канвасе -->
      <div v-else class="mx-5">
        <CanvasGantt
          :stepDataGant="dataGantMod"
          :canvasWidth="gWidth"
          :canvasHeight="gHeight"
        />
      </div>

    </div>
    <v-snackbar style="position: absolute;top: 0; bottom: 0; z-index: 999" v-model="tooltipShow">{{tooltip}}</v-snackbar>
  </v-card>
</template>

<script>
import moment from "moment";
import { Carousel, Slide } from 'vue-carousel';
import 'moment/locale/ru'
import GantParital from "@/ui/GantParital";
import CanvasGantt from "@/ui/canvas/CanvasGantt.vue"
import ButtonGroup from "@/ui/ButtonGroup.vue";
import interact from 'interactjs'
moment.locale("ru")

export default {
  name: "GantDiagram",
  components: {
    GantParital,
    CanvasGantt,
    ButtonGroup,
  },
  props: {
    dataGant: Array,
    steps: Boolean,
    ganttType: Boolean,
    titleStr: String,
    showStep: {
      type: Boolean,
      default: true
    },
    showOpers: {
      type: Boolean,
      default: true
    },
    heightMunus:{
      type: Number,
      default: 50
    }
  },
  watch: {

  },
  computed :{

  },
  created() {
    this.gWidth = window.innerWidth-this.heightMunus;
    this.gHeight = window.innerHeight-this.heightMunus;
    this.showStepLoc = this.showStep;
    this.showOpersLoc = this.showOpers;

    //Выбираем цвет для диаграммы
    this.dataGant.forEach((el) => {
      el["color"] = '#'+(0x1000000+Math.random()*0xffffff).toString(16).substr(1,6)
    });

    this.clickCBOpers();
  },
  mounted(){
    this.parsePropData();
    this.footerVision();
  },
  data() {
    return {
      gWidth: 0,
      gHeight: 0,
      dataGantMod: [],
      showStepLoc: true,
      showOpersLoc: true,
      rows: [],
      gantData: {},
      gantSteps : [],
      myChartStart: "",
      myChartEnd: "",
      monthsData: [],
      pageNumber : 0,
      sortButtons : [
          {
            name : "По годам",
            emit : "yearSort",
          },
        {
          name : "По кварталам",
          emit : "quartSort"
        }
      ],
      listData : [],
      size : 10,
      keyHack : 0,
      mode : "months",
      gantState : true,
      footerNotify : false,
      snackbar : false,
      colors : ["#6200EE","#03DAC6","#57F267","#EF2FAA","#B03532","#E2CE27"],
      isActive: false,
      chartValuesLi : {
        flex: 1,
        'min-width' : '100px',
        'text-align': 'center',
        'cursor' : 'pointer'
      },
      tooltipShow : false,
      tooltip: "",
      currentMonth : ""
    }
  },
  methods: {

    parsePropData() {
      this.rows = [];
      this.findDate(this.dataGant)

      for (const argument of this.dataGant) {
        this.rows.push({
          id: argument.fNumber,
          text: argument.spWorksName,
          start_date: (argument.fDateStart).split(' ')[0],
          end_date: argument.fDateFinish.split(' ')[0],
          progress: 0.5,
          duration: Number(argument.fTrud),
          fullMonths :  this.calculateMonthsBetween(this.reverseAndCutDate(argument.fDateStart),
              this.reverseAndCutDate(argument.fDateFinish)),
          step : Number(argument.StepNumber),
        })
      }
      if (this.rows.length >= 10) {
        this.chartValuesLi["min-width"] = '100px'
      } else {
        this.chartValuesLi["min-width"] = '100px'
      }
    },

    calculateMonthsBetween(d1,d2){
      let date1 = new Date(d1)
      let date2 = new Date(d2)
      let count = this.calculateMonthValues(d1,d2)
      let month = date1.getMonth()
      let dates = []
      for (let i = 0; i < count; i++) {
        month++
        let res = ("0" + (month + 1)).slice(-2)
        dates+= (res) + '-' + date1.getFullYear() + '|'
      }
        return dates
    },
    reverseDate(date, separator = '.'){
      return date.split(separator).reverse().join(separator)
    },
    reverseAndCutDate(date){
      let splitted =  date.split(' ')[0]
      return this.reverseDate(splitted)
    },
    footerVision(){
      setTimeout(()=>{
        this.snackbar = true
      }, 1000)
    },

    //Вычисление количества месяцев в промежутке времени
    calculateMonthValues(d1, d2) {
      let date1 = new Date(d1)
      let date2 = new Date(d2)

      let months;
      months = (date2.getFullYear() - date1.getFullYear()) * 12;
      months -= date1.getMonth() + 1;
      months += date2.getMonth();
      return months <= 0 ? 0 : months;
    },
    // Создает массив месяцев между двумя датами
    async calculateMonth(monthCount, d1, mode) {
      let date1 = new Date(d1)
      let dates = []
      let yearNow = date1.getFullYear();
      if(mode == "months"){
        dates[0] = {month: date1.getMonth(), year: yearNow}
        for (let i = 1; i < monthCount + 2; i++) {
          if (dates[i - 1].month == 11) {
            yearNow++
            dates[i] = {month: 0, year: yearNow}
          } else {
            dates[i] = {month: (dates[i - 1].month) + 1, year: yearNow}
          }
        }
        this.toMoment(dates, "months")
      }
      else if(mode == "days"){
        for (let i = 1; i < monthCount; i++) {
          dates[i] = {day : i, month : date1.getMonth() + 1,year : date1.getFullYear() }
        }
       this.toMoment(dates,'days')
      }
    },
    //Найти максимальное минимальное значение даты в массиве
    async findDate(data) {
      let startDates = []
      let endDates = []
      for (const elem of data) {
        startDates.push(moment(elem.fDateStart, "DD.MM.YYYY").unix())
        endDates.push(moment(elem.fDateFinish, "DD.MM.YYYY").unix())
      }
      let minDate = moment.unix(this.findMin(startDates)).format("YYYY.MM.DD")
      let maxDate = moment.unix(this.findMax(endDates)).format("YYYY.MM.DD")
      let monthCount = this.calculateMonthValues(minDate, maxDate)
      await this.calculateMonth(monthCount, minDate, 'months');
      this.keyHack++
      //this.createChart()
    },
    findMin(array) {
      if (array.length < 1) return null
      let min = array[0]
      for (let i = 0; i < array.length; i++) {
        if (array[i] < min)
          min = array[i]
      }
      return min
    },
    findMax(array) {
      if (array.length < 1) return null
      let max = array[0]
      for (let i = 0; i < array.length; i++) {
        if (array[i] > max)
          max = array[i]
      }
      return max
    },
    toMoment(dates, mode){
      let formatted = []
      if(mode == "months"){
        for (let i = 0; i < dates.length; i++) {
          formatted.push((moment(dates[i].year + '-' + (dates[i].month + 1))).format("MM-YYYY"))
        }
      }
      else if(mode == "days"){
        for (let i = 1; i < dates.length; i++) {
          formatted.push((moment(dates[i].month + '-' + (dates[i].day) + '-' + dates[i].year)).format("DD-MM-YYYY"))
        }
      }

      this.monthsData = formatted
    },
    goBack(){
      this.mode = "months"
      this.parsePropData()
      this.footerVision();
      this.keyHack++
    },
    nextPage(){
      this.pageNumber++;
    },
    prevPage(){
      this.pageNumber--;
    },

    closeGant(){
      this.$emit("closedGant")
    },
    async openDays(month){

      const numDaysInMonth = moment(month, 'MM-YYYY').daysInMonth()
      let parsedMonth = month.split('-')
      this.chartValuesLi["min-width"] = '35px'
      this.currentMonth = String(moment(month, 'MM-YYYY').format('MMMM YYYY'))
      this.mode="days"
      this.keyHack++
      parsedMonth.reverse()
      parsedMonth.push('01')
      let parsedString = parsedMonth.join('.')
      let result = await this.calculateMonth(numDaysInMonth, parsedString,"days")
      this.parseToMoment()

    },

    parseToMoment(value){
      let momentDates = []
      for (const monthsDatum of this.monthsData) {
        momentDates.push({
        name :   monthsDatum.split('-').splice(0,1).join(),
          value : monthsDatum
      })
      }
      this.monthsData = momentDates
    },
    showGant(){
      this.gantState = true
    },
    snackbarShow(text){
      this.tooltipShow = true
      this.tooltip = text
    },
    snackbarOut(text){
      this.tooltipShow = false
    },
    yearSort(){

      let yearMonths = []
      for (const yearMonth of this.monthsData) {
        let res =  (yearMonth.split('-')).splice(1,1).join()
        yearMonths.push(res)
      }

      this.monthsData = this.uniq(yearMonths)
      this.mode = "year"
      this.keyHack++

    },
    uniq(a) {
      let seen = {};
      let out = [];
      let len = a.length;
      let j = 0;
      for (let i = 0; i < len; i++) {
        let item = a[i];
        if (seen[item] !== 1) {
          seen[item] = 1;
          out[j++] = item;
        }
      }
      return out;
    },

    clickCBOpers() {
      let data = this.dataGant;
      if (!this.showStepLoc) data = data.filter((el)=>el.StepNumber == '')
      if (!this.showOpersLoc) data = data.filter((el)=>el.fNumber == '');
      this.dataGantMod = data
    },

  }
}
</script>
<style>

</style>