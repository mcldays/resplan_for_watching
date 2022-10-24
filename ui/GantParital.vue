<template>
  <div class="mainGant">
  <div class="draggable" style="display: flex; margin-left: 100px">
    <div class="chart-wrapper" >
      <div>
        <ul class="chart-values">
          <li class="chartManage" style="min-width: 500px">Имя</li>
          <li class="chartManage" style="min-width: 200px">Трудоемкость</li>
          <li  class="chartDates" @dblclick="openDays(date)"
              v-bind:style="chartValuesLi" :data-days="monthsData[key]" v-for="(date,key) in this.monthsData" :key="key">{{
             gantMode == "days" ? date.name : date
            }}</li>
        </ul>
      </div>
      <div v-for="(work,index) in this.rows" :key="index">
        <div v-if="work.step!=0 && steps">
          <span style="font-size: 20px">Этап {{work.step}}</span>
          <hr style="border-width: 7px">
        </div>

        <ul class="chart-bars">
          <div style="display: flex">
            <div class="textBox"
                 @mouseover="snackIn(work.text)" @mouseleave="snackOut(work.text)"
            >
              <span class="stringWork">{{work.text}}</span>
            </div>
            <div class="textBox" style="left: 525px; width: 200px"
                 @mouseover="snackIn(work.text)" @mouseleave="snackOut(work.text)"
            >
              <span style="text-align: center;" class="stringWork">{{work.duration}}</span>
            </div>
          </div>
          <li
              @mouseover="snackIn(work.text)" @mouseleave="snackOut(work.text)"
              :data-duration="work.start_date+ '-' + work.end_date"  data-color="#b03532" style="font-size: 15px"
              v-bind:class="{active : isActive}" :data-month="work.fullMonths"
              v-bind:style="{'max-width' : maxWidth + 'px' + '!important'}"
              :data-lastMonth="work.end_date"
          >
          </li>
        </ul>

      </div>

    </div>

  </div>

  </div>
</template>

<script>
import moment from "moment";
import 'moment/locale/ru'
import interact from 'interactjs'
moment.locale("ru")
export default {
  name: "GantParital",
  props : {
    rows : Array,
    steps : Boolean,
    monthsData : Array,
    gantMode : String,
    chartValuesLi : Object,
    currentMonth : String

  },
  mounted() {
    //this.monthsDataLocal = JSON.parse(JSON.stringify(this.monthsData))
    switch(this.gantMode){
      case 'months' : this.createChartMonths()
            break
      case 'days' : this.createChartDays()
            break
      case 'year' : this.createChartYear()
            break
      case 'quart': this.createChartQuart()
    }

  },
  // watch : {
  //   monthsData : function (){
  //
  //   },
  //   deep: true
  // },

  data() {
    return {
      colors : ["#6200EE","#03DAC6","#57F267","#EF2FAA","#B03532","#E2CE27"],
      isActive: false,
      tooltipShow : false,
      maxWidth : "",
      tooltip: "",
      BLOCK_WIDTH : 100,
      monthsDataLocal : []
    }
  },
  //TODO Отрефакторить попилить на методы
  methods: {
    createChartMonths(mode){
      const monthsSelector = document.querySelectorAll(".chart-values .chartDates")

        const optionLi = document.querySelectorAll(".chart-values .chartManage")
        let manageContains = [...optionLi]
        let manageOffset = manageContains[0].offsetWidth + manageContains[1].offsetWidth //TODO сделать динамически, не явно
        const tasks = document.querySelectorAll(".chart-bars li")
        const months = [...monthsSelector]
      if(months.length !=0) {
        let left, width = 0
        let defaultOffset = months[0].offsetLeft
        let daysOffset = months[0].offsetWidth / 30

        tasks.forEach(el => {
          const duration = el.dataset.duration.split('-')
          let startDay = duration[0]
          let endDay = duration[1]
          let days = this.calculateDaysValues(this.reverseDate(startDay), this.reverseDate(endDay))
          let leftDaysOffset = (startDay.split('.').slice(0, 1) * daysOffset)
          let widthDaysOffset = (days * daysOffset)
          const filteredArray = months.filter(function (mon) {
            if (mon.textContent == startDay.split('.').slice(1).join('-'))
              return mon
          })
          left = filteredArray[0].offsetLeft - defaultOffset + leftDaysOffset + manageOffset
          const FilteredArrayForWidth = months.filter(function (secondMon) {
            if (secondMon.textContent == endDay.split('.').slice(1).join('-')) {
              return secondMon
            }
          })

          width = daysOffset * days
          if (width == 0) {
            width = filteredArray[0].offsetWidth
          }
          el.style.left = `${left}px`
          el.style.width = `${width}px`
          el.style.backgroundColor = this.getRandomColor()
          el.style.opacity = 1
        })
        interact('.mainGant').draggable({
          inertia: true,
          modifiers: [
            interact.modifiers.restrictRect({
              endOnly: true
            })
          ],
          autoScroll: true,
          listeners: {
            move: this.dragMoveListener
          }
        })
      }
    },
    createChartDays() {

      this.BLOCK_WIDTH = 35
      const monthsSelector = document.querySelectorAll(".chart-values .chartDates")
      const optionLi = document.querySelectorAll(".chart-values .chartManage")
      let manageContains = [...optionLi]
      let manageOffset = manageContains[0].offsetWidth + manageContains[1].offsetWidth
      const tasks = document.querySelectorAll(".chart-bars li")
      const months = [...monthsSelector]
      let monthsSplitted = this.splitAndReverse(months[0].dataset.days,'-')
      console.log(months[0].dataset)
      this.maxWidth = this.BLOCK_WIDTH * months.length + manageOffset
      let left, width = 0
      let defaultOffset = months[0].offsetLeft
      tasks.forEach(el => {
        console.log(el.dataset)
        const duration = el.dataset.duration.split('-')
        const emptyMonth = el.dataset.month.split('|')
        const lastMonth = el.dataset.lastmonth
        let lastMonthSplited = this.splitAndReverse(lastMonth,'.')
        let startDay = duration[0]
        let endDay = duration[1]
        let days = this.calculateDaysValues(this.reverseDate(startDay), this.reverseDate(endDay))

        emptyMonth.forEach(elMonth=>{
          if(elMonth === monthsSplitted
              && elMonth !== ""){
            el.style.left = `${manageOffset}px`
            el.style.width = `${this.BLOCK_WIDTH* (months.length)}px`
            el.style.backgroundColor = this.getRandomColor()
            el.style.opacity = 1
          }
          else if(lastMonthSplited == monthsSplitted){
            const filteredArray = months.filter(function (mon) {
              if (mon.dataset.days == endDay.split('.').join('-'))
                return mon
            })
            let date1 = (months[0].dataset.days).split('-').join('.')
            let date2 = endDay
            let daysOffset = this.calculateDaysValues(this.reverseDate(date1), this.reverseDate(date2))
            width = this.BLOCK_WIDTH * daysOffset
            left = manageOffset
            el.style.left = `${left}px`
            el.style.width = `${width}px`
            el.style.backgroundColor = this.getRandomColor()
            el.style.opacity = 1

          }
        })

        const filteredArray = months.filter(function (mon) {
          if (mon.dataset.days == startDay.split('.').join('-'))
            return mon
        })

        if (filteredArray.length > 0) {
          left = filteredArray[0].offsetLeft - defaultOffset + manageOffset
          width = this.BLOCK_WIDTH * days
         if(!((this.maxWidth - left - width) > 0)){     //Если нет отступа слева, значит работа заканчивается в другом месяце
           width = this.maxWidth - left
         }
          el.style.left = `${left}px`
          el.style.width = `${width}px`
          el.style.backgroundColor = this.getRandomColor()
          el.style.opacity = 1
        }
      })
    },
    createChartYear(){
     return
    },
    openDays(day){
      this.$emit("openDay", day)
    },

    calculateDaysValues(d1,d2){
      let date1 = new Date(d1)
      let date2 = new Date(d2)
      let dataDays = 0;
      dataDays = (date2 - date1) /(60 * 60 * 24 * 1000)
      return dataDays
    },

    getRandomColor(){
      return this.colors[Math.floor(Math.random() * this.colors.length)]
    },
    splitAndReverse(date, separator){
      if(date !== undefined)
      return (date.split(separator)).splice(1,2).join('-')
    },
    reverseDate(date, separator = '.'){
      return date.split(separator).reverse().join(separator)
    },
    dragMoveListener(event){
      let target = event.target
      let x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx
      let y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy
      target.style.transform = 'translate(' + x + 'px, ' + y + 'px)'
      target.setAttribute('data-x', x)
      target.setAttribute('data-y', y)
    },
    snackIn(text){
      this.$emit('snackIn', text)
    },
    snackOut(text){
      this.$emit('snackOut', text)
    },
    isFullMonth(work){
      const monthsSelector = document.querySelectorAll(".chart-values .chartDates")
      const months = [...monthsSelector]
      if(months.length!==0 && this.gantMode == "days"){
        for (const fullMonth of work.fullMonths) {
          let res = ((months[0].textContent).split('-').splice(1,2).join('.'))
          if(fullMonth === res){
            return true
          }
          else{
            return false
          }
        }
      }
    }
  }


}
</script>

<style>
li{
  list-style-type: none;
  max-height: 100px;
  height: 25px;
}
ul{
  list-style-type: none;
}
.draggable{
  position: absolute;
  height: 3000px;
}

.chart-wrapper {
  padding: 0 10px;
  height: auto;
  margin: 0 auto 0;
  touch-action: none;
  user-select: none;
  transform: translate(0px, 0px);
}
:root {
  --divider: lightgrey;
}

.chart-wrapper .chart-values {
  position: relative;
  display: flex;
  margin-bottom: 20px;
  font-weight: bold;
  font-size: 1.2rem;
}

.chart-wrapper .chart-values li {
  flex: 1;
  min-width: 100px;
  text-align: center;
}

.chart-wrapper .chart-values li:not(:last-child) {
  position: relative;
}
/*.chartDates{*/
/*  min-width: 100px!important;*/
/*}*/

.chart-wrapper .chart-values li:not(:last-child)::before {
  content: '';
  position: absolute;
  right: 0;
  min-height: 3000px;
  border-right: 1px solid var(--divider);
}

:root {
  --white: #fff;
}

.chart-wrapper .chart-bars li {
  position: relative;
  color: var(--white);
  margin-bottom: 15px;
  font-size: 16px;
  border-radius: 20px;
  width: 0;
  opacity: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: flex;
  flex-direction: column;
}

.chart-wrapper .chart-bars li:hover {
  color: black;
}
.stringWork{

  white-space: nowrap;
  overflow: hidden;
  display: block;
  text-overflow: ellipsis
}

.textBox{
  font-weight: bold;
  position: absolute;
  left: 0;
  right: 0;
  width: 500px
}
.chart-bars{
  display: flex;
  position: relative;
  border-bottom: 1px solid black;
  margin: revert;
}

@media screen and (max-width: 600px) {
  .chart-wrapper .chart-bars li {
    padding: 10px;
  }
}
</style>