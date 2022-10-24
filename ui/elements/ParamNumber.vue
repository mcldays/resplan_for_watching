<template>
  <div class="text">
    <v-text-field
        ref="paramData.key.value"
        class="pa-2"
        hide-details
        :label="paramData.key.text"
        v-model="paramData.value"
        prepend-icon="mdi-numeric"
        :disabled="paramData.key.readonly ? true : false"
        type="number"
        required
    ></v-text-field>
  </div>
</template>

<script lang="ts">
import {Component, Prop, Vue} from 'vue-property-decorator'


@Component({
  components: { },
})

export default class ParamNumber extends Vue{

  @Prop() paramData : any


}

</script>

<style scoped>

</style>