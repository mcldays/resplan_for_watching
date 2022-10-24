<template>
  <div class="text">
    <v-textarea
        ref="paramData.key.value"
        outlined
        hide-spin-buttons
        rows="1"
        auto-grow
        class="pa-2"
        hide-details
        :label="paramData.key.text"
        v-model="paramData.value"
        :autofocus=" paramKey === 1 ? true : false"
        prepend-icon="mdi-pencil-outline"
        :disabled="paramData.key.readonly ? true : false"
    />
  </div>
</template>

<script lang="ts">
import {Component, Prop, Vue} from 'vue-property-decorator';

@Component({
  components: { },
})

export default class ParamString extends Vue{

  @Prop() paramData : any
  @Prop() paramKey : any

}

</script>

<style scoped>

</style>