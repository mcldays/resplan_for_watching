<template>
  <v-card class="text" style="margin:15px">
    <h4>
      <v-icon style="margin:10px">mdi-format-list-bulleted-square</v-icon>
      {{paramData.key.text}}
      <v-divider/>
    </h4>
    <div
      v-for="(listItem, key) in paramData.value.split('|')"
      :key="key"
    >
      <div style="display:flex">
        <v-textarea
          :value="listItem"
          :autofocus=" key === 1 ? true : false"
          prepend-icon="mdi-circle-medium"
          auto-grow
          rows="1"
          outlined
          hide-details
          hide-spin-buttons
          dense
          @change="changeListItem($event, paramData, key)"
        />
        <v-icon color="red" @click="deleteItemFromList(paramData,key)">mdi-window-close</v-icon>
      </div>
    </div>
    <v-btn @click="addItemToList(paramData)" block>
      <v-icon color="green">mdi-plus-circle-outline</v-icon>
      Добавить строку
    </v-btn>
  </v-card>
</template>

<script lang="ts">
import {Component, Prop, Vue} from 'vue-property-decorator'

@Component({
  components: { },
})

export default class ParamList extends Vue{

  @Prop() paramData : any 

  addItemToList(item: any) {
    item.value = item.value + '|'
  }

  deleteItemFromList(item: any, deleteKey: any) {
    item.value = item.value.split('|').filter((el:any,index:any)=>{if(index!==deleteKey) return el}).join('|')
  }

  changeListItem(new_value: any, list: any, cur_Key: any) {
    let newlist = list.value.split('|')
    newlist = newlist.map((el:any,index:any)=>{ return index===cur_Key ? new_value : el })
    list.value = newlist.join('|')
  }

}

</script>

<style scoped>

</style>