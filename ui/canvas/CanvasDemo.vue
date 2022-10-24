<template>
  <div>
    <div  @change="showDivCanvas" :class="!showCanvas?'visually-hidden':''">
        <canvas 
          id="cDemo" 
          :width="canvasWidth"
          :height="canvasHeight"
          @click="clickCanvas"
        />
      <v-card v-if="ParamsPanelState">
        <v-card-text>
          <div style="display:flex">
            <div>
              <v-text-field v-model="canvasWidth" label="canvasWidth" type="number" hide-details outlined dense class="ma-2"/>
              <v-text-field v-model="canvasHeight" label="canvasHeight" type="number" hide-details outlined dense class="ma-2"/>
              <v-checkbox v-model="clearRect" label="clearRect" hide-details class="ma-2"/>
              <v-checkbox v-model="isTextures" label="isTextures" hide-details class="ma-2"/>
              <v-checkbox v-model="dotEffect" label="dotEffect" hide-details class="ma-2"/>
              <v-checkbox v-model="dotEffect_fixColor" label="dotEffect_fixColor" hide-details class="ma-2"/>
            </div>
            <div>
              <v-text-field v-model="psetCount" label="psetCount" type="number" hide-details outlined dense class="ma-2"/>
              <v-text-field v-model="waitSeconds" label="waitSeconds" type="number" hide-details outlined dense class="ma-2"/>
              <v-text-field v-model="radialSpeed" label="radialSpeed" type="number" hide-details outlined dense class="ma-2"/>
              <v-text-field v-model="minPsetRadius" label="minPsetRadius" type="number" hide-details outlined dense class="ma-2"/>
            </div>
            <div>
              <v-checkbox v-model="radomDirection" label="radomDirection" hide-details class="ma-2"/>
              <v-checkbox v-model="recalcDirection" label="recalcDirection" hide-details class="ma-2"/>
              <v-checkbox v-model="radomRadius" label="radomRadius" hide-details class="ma-2"/>
              <v-checkbox v-model="radomOrbitalDiametrX" label="radomOrbitalDiametrX" hide-details class="ma-2"/>
              <v-checkbox v-model="radomOrbitalDiametrY" label="radomOrbitalDiametrY" hide-details class="ma-2"/>
              <v-checkbox v-model="randomCenter" label="randomCenter" hide-details class="ma-2"/>
            </div>
          </div>
          <v-btn @click="calcBeginParams" class="ma-5">Refresh Canvas</v-btn>
          <v-btn @click="showCanvasClick" class="ma-5">hide Canvas</v-btn>
        </v-card-text>
      </v-card>
    </div>
    <v-btn v-if="!showCanvas" @click="showCanvasClick" class="ma-5">show Canvas</v-btn>
  </div>
</template>


<script lang="ts">
import {Component, Prop, Watch} from 'vue-property-decorator'
import {mixins} from "vue-class-component";
import {tableMixin} from "@/mixins/tableMixin";
import moment from "moment";


@Component({
  components: { }
})
export default class CanvasDemo extends mixins(tableMixin) {

  private showCanvas = true

  //main params
  @Prop({default: 300}) canvasWidth: any
  @Prop({default: 300}) canvasHeight: any
  private psetCount: any = 10
  private waitSeconds: any = 5
  private radialSpeed: any = 0.15
  private minPsetRadius: any = 10
  private radomDirection: any = true
  private recalcDirection: any = false
  private radomRadius: any = true
  private radomOrbitalDiametrX: any = true
  private radomOrbitalDiametrY: any = true
  private radomOrbitalDiametrZ: any = true
  private dotEffect = true
  private dotEffect_fixColor = false
  private clearRect = false
  private isTextures = false
  private randomCenter = false

  //demo
  private cDemo:any = null
  private ParamsPanelState = false

  private textures = ['🦊', '🦓', '🐹', '🐨','🦜','🐙','🐔','🐏','🐇']

  //list of objects
  private psets: any[] = []

  async mounted() {
    if (this.showCanvas) {
      this.cDemo = (document.getElementById("cDemo") as any).getContext("2d")
      this.calcBeginParams()
      this.getNextLog()
    }
  }

  calcBeginParams() {
    this.psets = []
    this.cDemo.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
    const stepRadian = Math.PI * 2 / this.psetCount
    let lastRadian = 0
    for(var i = 0; i < this.psetCount; i++) {
      this.psets.push( { 
        xCenter: this.randomCenter ? this.canvasWidth * Math.random() : this.canvasWidth/2,
        yCenter: this.randomCenter ? this.canvasHeight * Math.random() : this.canvasHeight/2,
        xDiametr: this.canvasWidth/1.5 * ( this.radomOrbitalDiametrX ? (Math.random()) : 1 ) - this.minPsetRadius,
        yDiametr: this.canvasHeight/1.5 * ( this.radomOrbitalDiametrY ? (Math.random()) : 1 ) - this.minPsetRadius,
        zDiametr: (this.canvasHeight/2+this.canvasWidth/2)/2 * ( this.radomOrbitalDiametrZ ? (Math.random()) : 1 ) - this.minPsetRadius,
        radius: this.minPsetRadius * ( this.radomRadius ? 1 + (Math.random()) : 1 ),
        color: this.getRandomColor(),
        direction: this.calcDirection(),
        radian: lastRadian,
        texture: this.textures[Math.floor(Math.random() * this.textures.length)]
      } )
      lastRadian += stepRadian
    }
    //console.log("this.psets", Math.random(), this.psets)
  }

  getNextLog() {
    setTimeout(() => {
      this.drawShot()
      if (this.dotEffect) { this.dotsEffect() }
      this.getNextLog()
    }, this.waitSeconds)
  }

  drawShot() {
    if (this.clearRect) {
      this.cDemo.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
    }
    this.psets.forEach((el: any) => this.drawPset(el))
  }

  calcDirection() {
    const rnd = Math.random()
    return this.radialSpeed * ( this.radomDirection ? rnd * (rnd - 0.5) / Math.abs((rnd - 0.5)) : 1 ) 
  }

  drawPset(pset: any) {

    if (!this.clearRect) {
      this.cDemo.beginPath();
      this.cDemo.fillStyle = this.getColor("white")
      this.tickCircle(pset, 1)
      this.cDemo.closePath();
    }

    pset.radian += pset.direction

    if (this.recalcDirection) { pset.direction = this.calcDirection() }

    this.cDemo.beginPath();
    this.cDemo.fillStyle = this.getColor(pset.color)
    this.tickCircle(pset, 0)
    this.cDemo.closePath();

  }

  tickCircle(pset: any, addRadius: number) {
    const point = this.getPoint(pset)
    if (this.isTextures) { 
      this.cDemo.textAlign = 'center';
      this.cDemo.textBaseline = 'middle';
      this.cDemo.font = ((pset.radius + addRadius) * 4).toString() + 'px serif';
      this.cDemo.fillText(pset.texture,pset.xCenter + point.x, pset.yCenter + point.y)
    } else {
      this.cDemo.arc(pset.xCenter + point.x, pset.yCenter + point.y, pset.radius + addRadius, 0, Math.PI*2)
    }
    this.cDemo.fill()
  }

  getPoint(pset: any) {
    return { 
      x: pset.xDiametr * Math.sin(pset.radian),
      y: pset.yDiametr * Math.cos(pset.radian),
      z: (pset.zDiametr * Math.cos(pset.radian)) + pset.zDiametr,
    }
  }

  /*project(point: any, sin: number, cos: number) {
    const rotX = cos * point.x + sin * (point.z - GLOBE_CENTER_Z);
    const rotZ = -sin * point.x + cos * (point.z - GLOBE_CENTER_Z) + GLOBE_CENTER_Z;
    this.sizeProjection = FIELD_OF_VIEW / (FIELD_OF_VIEW - rotZ);
    return { 
      xProject: (rotX * this.sizeProjection) + PROJECTION_CENTER_X,
      yProject: (point.y * this.sizeProjection) + PROJECTION_CENTER_Y,
    }
  }*/

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

  getRandomColor() {
    return '#'+(0x1000000+Math.random()*0xffffff).toString(16).substr(1,6)
  }

  dotsEffect() {
    this.cDemo.beginPath();
    for(var i = 0; i < 500; i++) {
      if (this.dotEffect_fixColor) { this.cDemo.strokeStyle = "black"} 
        else { this.cDemo.strokeStyle = this.getRandomColor();}
      const xxx = Math.random()
      if (xxx>0.5) {
        this.cDemo.rect(this.canvasWidth*Math.random(),this.canvasHeight*Math.random(),1,10*xxx);
      } else {
        this.cDemo.rect(this.canvasWidth*Math.random(),this.canvasHeight*Math.random(),10*xxx,1);
      }
    }
    this.cDemo.stroke();
    this.cDemo.closePath();
  }

  clickCanvas() {
    this.ParamsPanelState = !this.ParamsPanelState 
  }


  showCanvasClick() {
    this.showCanvas = !this.showCanvas
  }

  showDivCanvas() {
    console.log("dsfdsffffds!!!")
    this.cDemo = (document.getElementById("cDemo") as any).getContext("2d")
  }

}
</script>

<style scoped>

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  border: 0;
  padding: 0;
  white-space: nowrap;
  clip: rect(0 0 0 0);
  overflow: hidden;
}

</style>

