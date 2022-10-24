<template>
  <v-app id="inspire">
  <div class="container" style="display: flex; flex-direction: column">
    <div>
      <h3 style="margin-top: 10px" class="flex font-weight-thin font-italic">404!</h3>
      <h3 style="margin-top: 10px" class="flex font-weight-thin font-italic">Такой страницы не существует</h3>
    </div>

    <div class="image">
      <v-img
          src="@/assets/chemical.png"
          max-height="700px"
          max-width="700px"
          style="margin-top: 100px"
      />
    </div>
    <v-btn @click="$router.push('/contracts')" style="margin-top: 50px">На главную</v-btn>


  </div>
  </v-app>
</template>

<script>
import {Component, Prop, Vue, Watch} from "vue-property-decorator";
import { Doughnut } from 'vue-chartjs/legacy'
@Component({
  components:{
    Doughnut
  },
})
export default class NotFound extends Vue{

}
</script>

<style scoped>
*{
  margin:0;
  padding:0;
  box-sizing:border-box;
}

body{
  overflow:hidden;
  background-color: #f4f6ff;
}

.container{
  width:100vw;
  height:100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: "Poppins", sans-serif;
  position: relative;
  left:6vmin;
  text-align: center;
}

.cog-wheel1, .cog-wheel2{
  transform:scale(0.7);
}

.cog1, .cog2{
  width:40vmin;
  height:40vmin;
  border-radius:50%;
  border:6vmin solid #f3c623;
  position: relative;
}


.cog2{
  border:6vmin solid #4f8a8b;
}

.top, .down, .left, .right, .left-top, .left-down, .right-top, .right-down{
  width:10vmin;
  height:10vmin;
  background-color: #f3c623;
  position: absolute;
}

.cog2 .top,.cog2  .down,.cog2  .left,.cog2  .right,.cog2  .left-top,.cog2  .left-down,.cog2  .right-top,.cog2  .right-down{
  background-color: #4f8a8b;
}

.top{
  top:-14vmin;
  left:9vmin;
}

.down{
  bottom:-14vmin;
  left:9vmin;
}

.left{
  left:-14vmin;
  top:9vmin;
}

.right{
  right:-14vmin;
  top:9vmin;
}

.cog2{
  position: relative;
  left:-10.2vmin;
  bottom:10vmin;
}

h1{
  color:#142833;
}

.first-four{
  position: relative;
  left:6vmin;
  font-size:40vmin;
}

.second-four{
  position: relative;
  right:18vmin;
  z-index: -1;
  font-size:40vmin;
}

.wrong-para{
  display: flex;
  flex-direction: column;
  position: absolute;
  bottom:15vmin;
  padding:3vmin 12vmin 3vmin 3vmin;
  font-weight:600;
  color:#092532;
}
</style>