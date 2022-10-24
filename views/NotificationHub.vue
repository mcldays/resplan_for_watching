<template>
<div style="z-index: 999">
  <v-snackbar
      max-width="80%"
      v-model="state"
      :multi-line="true"
      :timeout="timeout"
      :color="backgroundColor"
  >
    <div v-if="isChips">
      <div
        v-for="(item, key) in text"
        :key="key"
      >
        <v-chip dark :color="item.color" class="ma-1">
          {{ item.name === "" ? "Значение Отсутствует" : item.name }}
        </v-chip>
        <v-chip v-if="item.value != '' & item.value != undefined" class="ma-1" dark :color="item.color" label outlined>
          <strong>{{ item.value }}</strong>
        </v-chip>
        <v-divider style="margin:5px;height:0px"/>
      </div>      
    </div>
    <div v-else>
      {{text}}
    </div>
  </v-snackbar>
</div>
</template>

<script lang="ts">
import {Component, Prop, Vue, Watch} from 'vue-property-decorator'
import eventBus from '@/eventBus'
@Component(
    {components : {

  }})
export default class NotificationHub extends Vue{
@Prop() text : any
@Prop() state : boolean
@Prop() timeout : number
@Prop({default: false}) isChips : boolean
@Prop({default: undefined}) backgroundColor : any

}
</script>
