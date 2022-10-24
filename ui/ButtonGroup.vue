<template>
  <div style="margin-left: 10px">
  <v-menu
      rounded="b-xl"
      offset-y
  >
    <template v-slot:activator="{ attrs, on }">
      <v-btn
          v-bind="attrs"
          v-on="on"
          outlined
          rounded
          small
      >
        {{ groupName }}
      </v-btn>
    </template>

    <v-list>
      <v-list-item
          v-for="(button,index) in buttons"
          :key="index"
          link
          @click="emitting(button)"
      >
        <v-list-item-title  v-text="button.name"></v-list-item-title>
      </v-list-item>
    </v-list>
  </v-menu>
  </div>
</template>

<script lang="ts">
import {Component, Prop, Vue, Watch} from 'vue-property-decorator'
import {buttonModel} from "@/models/buttonModel";
@Component({
  components: {

  }
})
export default class buttonGroup extends Vue{
@Prop({default : ""}) groupName : string
@Prop({default : []}) buttons : buttonModel[]
  emitting(button : buttonModel){
      this.$emit(button.emit)

  }

}
</script>

<style scoped>

</style>