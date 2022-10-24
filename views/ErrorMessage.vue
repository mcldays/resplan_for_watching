<template>
<div style="display: flex; ">
  <v-card shaped style="display:flex; background-color: #ff033e; padding: 0 5px 0 5px"   elevation="10">
    <v-icon
        dark
        right
    >
      mdi-cancel
    </v-icon>
    <v-card-text style="font-size: 17px; color: white; white-space: normal;"  >
        <span>Ошибка: {{ text }} </span>
        <span></span>
    </v-card-text>
  </v-card>
</div>
</template>

<script lang="ts">
import {Component, Prop, Vue, Watch} from 'vue-property-decorator'
@Component({

})
export default class ErrorMessage extends Vue{
@Prop() text : string
}
</script>

<style scoped>

</style>