<template>
  <div class="text">
    <v-checkbox
      ref="paramData.key.value"
      class="ma-2"
      :label="paramData.key.text"
      prepend-icon="mdi-check"
      :disabled="paramData.key.readonly ? true : false"                    
      v-model="paramData.value"
      required
    />
  </div>
</template>

<script lang="ts">
import {Component, Prop, Vue} from 'vue-property-decorator';

@Component({
  components: { },
})

export default class ParamBoolean extends Vue{

  @Prop() paramData : any

  created(){
    this.paramData.value = this.paramData.value === "False" ? "" : this.paramData.value
  }

}

</script>

<style scoped>

</style>