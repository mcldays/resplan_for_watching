<template>
    <v-dialog
        v-model="stateModal"
        max-width="500px"
    >
      <v-card>
        <v-card-title>{{ title }}</v-card-title>
          <v-card-text class="text-center pt-5">
            {{message}}
          </v-card-text>
        <div style="display: flex; position: sticky; bottom: 0; z-index: 999" class="pa-5 grey lighten-4">
          <v-btn depressed color="primary" @click="OK()">Да</v-btn>
          <v-spacer></v-spacer>
          <v-btn depressed color="error" @click="Cancel()">Отмена</v-btn>
        </div>
      </v-card>  
    </v-dialog>
</template>

<script lang="ts">
import {Component, Prop, Vue, Watch} from 'vue-property-decorator'
@Component({
  components : {
  }
})
export default class MessageBox extends Vue  {

@Prop({ default: false}) vModel: any
@Prop({ default: "" }) title: string
@Prop({ default: "" }) message: string
  private stateModal  = false

  @Watch("vModel", {deep:true})
  openDialog(){
    this.stateModal = this.vModel
  }


OK(index: number): void {
    this.stateModal = !this.stateModal
    this.$emit("result", true)
  }

Cancel(index: number): void {
    this.stateModal = !this.stateModal
    this.$emit("result", false)
  }

}
</script>

<style scoped>

</style>