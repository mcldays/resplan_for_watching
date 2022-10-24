<template>
<div v-if="!isIcon" style="margin-left: 10px">
  <v-btn
      style="margin-left: 10px"
      v-for="(but,index) in button"
      :key="index"
      outlined
      rounded
      small
      @click="emitting(but.emit)"
  >
    {{ but.name }}
  </v-btn>
</div>
  <div v-else>
    <v-btn
        outlined
        rounded
        small
        @click="emitting"
        icon
    >
      {{iconName}}
    </v-btn>
  </div>
</template>

<script lang="ts">
import {Component, Prop, Vue, Watch} from 'vue-property-decorator'
import {buttonModel} from "@/models/buttonModel";
@Component({
  components: {

  }
})
export default class TableButton extends Vue {
  @Prop() button: buttonModel[]
  @Prop({default : false}) isIcon : boolean
  @Prop({default : ""}) iconName  : string

  emitting(emit :string) {
    this.$emit(emit)
  }
}
</script>

<style scoped>

</style>