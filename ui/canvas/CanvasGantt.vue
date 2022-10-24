<template>
    <div id="container">
      <canvas 
        id="c" 
        :width="canvasWidth" 
        :height="canvasHeight"
        @mousewheel="mousewheel" 
        @mousedown="canvasKeyDown"
        @mouseup="canvasKeyUp"
        @mousemove="canvasMove"
      />
    </div>
</template>


<script lang="ts">
import {Component, Prop, Watch} from 'vue-property-decorator'
import {mixins} from "vue-class-component";
import {tableMixin} from "@/mixins/tableMixin";
import {baseController} from "@/controllers/baseController";
import moment from "moment";


@Component({
  components: { }
})
export default class CanvasGantt extends mixins(tableMixin) {

  //Data
  @Prop({default : ()=>[]}) stepDataGant: any[]
  @Prop({default : 1800}) canvasWidth: any
  @Prop({default : 750}) canvasHeight: any
  @Prop({default : true}) showDates: any

  //canvas
  private vueCanvas:any = null

  private zoom = 1
  private fixColors:any = []
  private zPosX = 0
  private zPosY = 0

  private zPosX_Down = 0
  private zPosY_Down = 0

  private isMoving = false

  private maxWidth = 0
  private maxHeight = 0

  //table params
  private mainFontName = "sans-serif"
  private mainFontSize = 14
  private charCount = 70

  //calculate
  private rowHeight = 0
  private stepRowWidth = 0
  private nameRowWidth = 0
  private trudRowWidth = 0
  private dateRowWidth = 0

  recalcParams() {
    this.rowHeight = this.mainFontSize*1.5
    this.stepRowWidth = this.mainFontSize*3/5 * 5
    this.nameRowWidth = this.mainFontSize*5.7/10 * this.charCount
    this.trudRowWidth = this.mainFontSize*3/5 * 6
    this.dateRowWidth = this.mainFontSize*3/5 * 8
  }

  async mounted() {
    this.recalcParams()
    //this.generate_fixColors()
    const canv:any = document.getElementById("c")
    this.vueCanvas = canv.getContext("2d")
    this.recalcZoom()
    this.printCanvas()
  }

  @Watch('stepDataGant', {deep : true})
  async openNewOrder() {
    this.recalcZoom()
    this.printCanvas()
  }

  generate_fixColors() {
    this.stepDataGant.forEach((el) => {
      el["color"] = this.getRandomColor()
    })
    /*for(var i = 0; i < 5000; i++) {
      this.fixColors.push(this.getRandomColor())
    }*/
  }

  recalcZoom() {
    this.zPosX = 0
    this.zPosY = 0
    const datesStart:any = this.stepDataGant.filter((el:any) => el.fDateStart !='').map( (el:any) => this.toDate(el.fDateStart))
    const datesFinish:any = this.stepDataGant.filter((el:any) => el.fDateFinish !='').map( (el:any) =>  this.toDate(el.fDateFinish))
    const minDate:any = new Date(Math.min.apply(null,datesStart))
    const maxDate:any = new Date(Math.max.apply(null,datesFinish))
    const diffDays = this.milisecToDays(maxDate - minDate)
    const fullLenght = this.stepRowWidth+this.nameRowWidth+this.trudRowWidth + (this.showDates ? this.dateRowWidth*2 : 0)
    this.zoom = (this.canvasWidth-20 - fullLenght)/diffDays
    //console.log("this.zoom",this.zoom)
  }

  printCanvas() {
    this.drawRect()
  }

  drawDateLine(diffDays:any, minDate:any, textPositionY:any, datepart:any) {
    const beginChart = this.zPosX+this.trudRowWidth + this.stepRowWidth + this.nameRowWidth + (this.showDates ? this.dateRowWidth*2 : 0)
    const multyply = (datepart === 'month' ? 30 : (datepart === 'year' ? 30*12 : 1))
    const formatDate:any = ( datepart === 'year' ? 'YYYY' : ( datepart === 'month' ? 'MMM' : ( datepart === 'day' ? 'D' : 1 ) ) )
    const years = Math.round(diffDays/multyply)
    let lastYear = "0"
    let lastMonth = ""
    if (datepart === 'year') {
      this.vueCanvas.fillText('Год', beginChart + diffDays*this.zoom/2, this.zPosY+textPositionY)
    }
    this.vueCanvas.moveTo(beginChart, this.zPosY+this.rowHeight);
    this.vueCanvas.lineTo(beginChart + diffDays * this.zoom+3*2, this.zPosY+this.rowHeight);

    //Second line
    for(var nextY = 0; nextY < years; nextY++) {
      const curDate = moment(new Date(minDate.getTime() + nextY*multyply*24*60*60*1000), 'YYYY-MM-DD')
      const textDate = curDate.format(formatDate)
      const xPos = beginChart + nextY * multyply * this.zoom

      if (datepart === 'month') {
        let nextYear = curDate.format('YYYY')
        if (nextYear != lastYear) {
          this.vueCanvas.fillText(nextYear, xPos + 3, this.zPosY+textPositionY)
          lastYear = nextYear
          this.vueCanvas.moveTo(xPos, this.zPosY+0);
          this.vueCanvas.lineTo(xPos, this.zPosY+this.rowHeight);
        }
      } else {
        if (datepart === 'day') {
          let nextMonth = curDate.format('MMMM YYYY')
          if (nextMonth != lastMonth) {
            this.vueCanvas.fillText(nextMonth, xPos + 3, this.zPosY+textPositionY)
            lastMonth = nextMonth
            this.vueCanvas.moveTo(xPos, this.zPosY+0);
            this.vueCanvas.lineTo(xPos, this.zPosY+this.rowHeight);
          }
        }
      }
      this.vueCanvas.fillText(textDate, xPos + 3, this.zPosY+this.rowHeight + textPositionY)
      //line divider
      this.vueCanvas.moveTo(xPos, this.zPosY+this.rowHeight);
      this.vueCanvas.lineTo(xPos, this.zPosY+this.rowHeight+this.stepDataGant.length*this.rowHeight + this.rowHeight);
    }

    this.vueCanvas.stroke();
  }

  //const textures = [getTexture('🦊'), getTexture('🦓'), getTexture('🐹'), getTexture('🐨')];

  drawRect() {
    //calc params
    const textPositionY = this.rowHeight/2
    const mainFont = this.mainFontSize + "px " + this.mainFontName
    const datesStart:any = this.stepDataGant.filter((el:any) => el.fDateStart !='').map( (el:any) => this.toDate(el.fDateStart))
    const datesFinish:any = this.stepDataGant.filter((el:any) => el.fDateFinish !='').map( (el:any) =>  this.toDate(el.fDateFinish))
    const minDate:any = new Date(Math.min.apply(null,datesStart))
    const maxDate:any = new Date(Math.max.apply(null,datesFinish))
    const diffDays = this.milisecToDays(maxDate - minDate)

    const headHeight = this.rowHeight*2
    const beginXOper = this.zPosX+this.stepRowWidth
    const beginXTrud = beginXOper+this.nameRowWidth
    const beginXChart = beginXTrud+this.trudRowWidth + (this.showDates ? this.dateRowWidth*2 : 0)
    const beginYHeader1 = this.zPosY+textPositionY
    const beginYHeader2 = this.zPosY+textPositionY+this.rowHeight
    this.maxWidth = Math.round(beginXChart + diffDays*this.zoom + 2*3)
    this.maxHeight = Math.round(headHeight+this.stepDataGant.length*this.rowHeight)

    this.vueCanvas.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
    this.vueCanvas.font = mainFont;
    this.vueCanvas.textBaseline = 'middle';

    //head
    this.vueCanvas.beginPath();
    this.vueCanvas.strokeStyle = this.getColor("black");
    this.vueCanvas.rect(this.zPosX, this.zPosY, this.stepRowWidth+this.nameRowWidth+this.trudRowWidth+ (this.showDates ? this.dateRowWidth*2 : 0), headHeight);
    this.vueCanvas.fillStyle = this.getColor("beige");
    this.vueCanvas.fill()
    this.vueCanvas.moveTo(this.zPosX, this.zPosY);
    this.vueCanvas.lineTo(this.zPosX, this.zPosY+this.maxHeight);
    this.vueCanvas.moveTo(this.zPosX, this.zPosY+this.maxHeight);
    this.vueCanvas.lineTo(this.maxWidth, this.zPosY+this.maxHeight);
    this.vueCanvas.rect(this.zPosX, this.zPosY, this.stepRowWidth+this.nameRowWidth, headHeight);
    this.vueCanvas.rect(beginXChart, this.zPosY, diffDays*this.zoom+3*2, headHeight);
    this.vueCanvas.stroke();
    this.vueCanvas.fillStyle = this.getColor("black")
    this.vueCanvas.fillText('💢', this.zPosX+3, beginYHeader1)
    this.vueCanvas.fillText('Этап', this.zPosX+3, beginYHeader2)
    this.vueCanvas.fillText('🛠', beginXOper+3, beginYHeader1)
    this.vueCanvas.fillText('Операция', beginXOper+3, beginYHeader2)
    this.vueCanvas.textAlign = 'center';
    this.vueCanvas.fillText('⌛', beginXTrud+this.trudRowWidth/2, beginYHeader1)
    this.vueCanvas.fillText('Труд', beginXTrud+this.trudRowWidth/2, beginYHeader2)
    if (this.showDates) {
      this.vueCanvas.fillText('▶️', beginXTrud+this.trudRowWidth+this.dateRowWidth/2+3, beginYHeader1)
      this.vueCanvas.fillText('Начало', beginXTrud+this.trudRowWidth+this.dateRowWidth/2+3, beginYHeader2)
      this.vueCanvas.fillText('⏹', beginXTrud+this.trudRowWidth+this.dateRowWidth*1.5+3, beginYHeader1)
      this.vueCanvas.fillText('Конец', beginXTrud+this.trudRowWidth+this.dateRowWidth*1.5+3, beginYHeader2)
      this.vueCanvas.rect(beginXTrud+this.trudRowWidth, this.zPosY, this.dateRowWidth, headHeight)
    }
    this.vueCanvas.textAlign = 'left';

    //draw date line
    if (this.zoom < 1.5) {
      this.drawDateLine(diffDays, minDate, textPositionY, 'year')
    } else {
      if (this.zoom < 30) {
        this.drawDateLine(diffDays, minDate, textPositionY, 'month')
      } else {
        this.drawDateLine(diffDays, minDate, textPositionY, 'day')
      }
    }

    //Generate list
    this.stepDataGant.forEach((el:any,index) => {
      const beginYChart = this.zPosY+headHeight+index*this.rowHeight
      //Opers
      if (this.showDates) { this.vueCanvas.rect(beginXTrud+this.trudRowWidth, beginYChart, this.dateRowWidth, this.rowHeight) }
      this.vueCanvas.rect(beginXTrud, beginYChart, diffDays*this.zoom+3*2+this.trudRowWidth + (this.showDates ? this.dateRowWidth*2 : 0 ), this.rowHeight)
      //this.vueCanvas.moveTo(beginXTrud, beginYChart+this.rowHeight);
      //this.vueCanvas.lineTo(beginXTrud+diffDays*this.zoom+3*2+this.dateRowWidth*2+this.trudRowWidth, beginYChart + this.rowHeight);
      this.vueCanvas.stroke();
      this.vueCanvas.fillStyle = this.getColor("black");
      this.vueCanvas.strokeStyle = this.getColor("black");

      //Operation name
      const OperName:any = (el.fNumber !=''?el.fNumber+'. ':'') + (el.spWorksName.length > this.charCount ? el.spWorksName.substring(0, this.charCount) + '...' :  el.spWorksName);
      if (el.StepNumber !== "") {
        this.vueCanvas.rect(beginXOper, beginYChart, this.nameRowWidth, this.rowHeight);
        this.vueCanvas.fillText(el.StepNumber, this.zPosX+3, beginYChart+textPositionY)
        this.vueCanvas.moveTo(this.zPosX, beginYChart);
        this.vueCanvas.lineTo(beginXOper, beginYChart);
        this.vueCanvas.stroke();
        //this.vueCanvas.strokeText(OperName, beginXOper+3, beginYChart+textPositionY)
        this.vueCanvas.fillText(OperName, beginXOper+3, beginYChart+textPositionY)
      } else 
      { 
        this.vueCanvas.fillText(OperName, beginXOper+3, beginYChart+textPositionY)
      }

      this.vueCanvas.textAlign = 'right';
      this.vueCanvas.fillText(el.fTrud, beginXTrud + this.trudRowWidth -3, beginYChart+textPositionY)
      this.vueCanvas.closePath();
      this.vueCanvas.textAlign = 'left';

      //workchart
      const fDateStart:any = this.toDate(el.fDateStart)
      const fDateFinish:any = this.toDate(el.fDateFinish)
      const beginBar = this.milisecToDays(fDateStart - minDate)*this.zoom
      const endBar = this.milisecToDays(fDateFinish - minDate)*this.zoom
      let chartLen = endBar - beginBar
      if (chartLen == 0) { chartLen = 1}
      this.vueCanvas.beginPath();

      if (this.showDates) {
        const begDate = fDateStart.format('DD.MM.YY') == 'Invalid date' ? '-' : fDateStart.format('DD.MM.YY')
        const endDate = fDateFinish.format('DD.MM.YY') == 'Invalid date' ? '-' : fDateFinish.format('DD.MM.YY')
        this.vueCanvas.fillText(begDate, beginXTrud+this.trudRowWidth+3, beginYChart+textPositionY)
        this.vueCanvas.fillText(endDate, beginXTrud+this.trudRowWidth+this.dateRowWidth+3, beginYChart+textPositionY)
      }

      this.vueCanvas.fillStyle = el.color
      if (el.StepNumber !== "") {
        this.vueCanvas.rect(beginXChart+beginBar, beginYChart + (this.rowHeight - this.rowHeight/3)/2, chartLen, this.rowHeight/3);
      } else {
        this.roundRect(beginXChart+beginBar, beginYChart+3, chartLen, this.rowHeight-3*2, 15);
      }
      this.vueCanvas.fill()
      this.vueCanvas.closePath();
    })

    this.vueCanvas.closePath();
  }

  roundRect (x:any, y:any, w:any, h:any, r:any) {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;
    this.vueCanvas.moveTo(x+r, y);
    this.vueCanvas.arcTo(x+w, y,   x+w, y+h, r);
    this.vueCanvas.arcTo(x+w, y+h, x,   y+h, r);
    this.vueCanvas.arcTo(x,   y+h, x,   y,   r);
    this.vueCanvas.arcTo(x,   y,   x+w, y,   r);
  }

  getColor(baseColor: any) {
    let resultColor = baseColor
    if(this.$vuetify.theme.dark == true) {
      switch(baseColor) {
        case "black":
          resultColor = "white";
          break;
        case "beige":
          resultColor = "grey";
          break;
        default:
          resultColor = baseColor
      }
    }
    return resultColor
  }

  dotsEffect() {
    this.vueCanvas.beginPath();
    for(var i = 0; i < 5000; i++) {
      this.vueCanvas.strokeStyle = this.getRandomColor();
      const xxx = Math.random()
      if (xxx>0.5) {this.vueCanvas.rect(1800*Math.random(),900*Math.random(),1,10*xxx);}
      else {this.vueCanvas.rect(1800*Math.random(),900*Math.random(),10*xxx,1);}
    }
    this.vueCanvas.stroke();
    this.vueCanvas.closePath();
  }

  milisecToDays(inp:any) {
    return inp/1000/60/60/24
  }

  getRandomColor() {
    return '#'+(0x1000000+Math.random()*0xffffff).toString(16).substr(1,6)
  }

  toDate(inp:any) {
    return moment(inp, 'DD.MM.YYYY')
  }

  zoomIn() {
    this.mainFontSize += 1
    if (this.mainFontSize > 28) { this.mainFontSize = 28 }
    this.recalcParams()
    this.drawRect()
  }

  zoomOut() {
    this.mainFontSize -= 1
    if (this.mainFontSize < 8) { this.mainFontSize = 8 }
    this.recalcParams()
    this.drawRect()
  }

  zoomDateIn() {
    this.zoom += this.zoom/10
    this.drawRect()
  }

  zoomDateOut() {
    this.zoom -= this.zoom/10
    if (this.zoom < 0.3) this.zoom = 0.3
    this.drawRect()
  }

  mousewheel(event: any) {
    event.preventDefault()
    if (event.deltaY > 0) {
      if (event.ctrlKey) { this.zoomOut() } else { this.zoomDateOut()}
    } else {
      if (event.ctrlKey) { this.zoomIn() } else { this.zoomDateIn()}
    }
  }

  canvasKeyDown(event:any) {
    this.isMoving = true
    this.zPosX_Down = event.offsetX-this.zPosX
    this.zPosY_Down = event.offsetY-this.zPosY
  }

  canvasKeyUp(event:any) {
    this.isMoving = false
  }

  canvasMove(event: any) {
    if (this.isMoving == true) {

      //Движения по Х
      //if (this.maxWidth > this.canvasWidth) {
        this.zPosX = event.offsetX - this.zPosX_Down
      //}

      //Движения по Y
      this.zPosY = event.offsetY - this.zPosY_Down

      //console.log(this.zPosX, this.zPosY, this.maxWidth, this.maxHeight, event.offsetX, event.offsetY, event.offsetX - this.zPosX_Down, event.offsetY - this.zPosY_Down)
      this.drawRect()
    }
  }

}
</script>

<style scoped>
#container {
  width: 100%;
  height: 100%;
  overflow: auto;
  border: 0px solid;
}

</style>
