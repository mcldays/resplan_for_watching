<template>
  <div class="text">
    <v-text-field
      :ref="'datefield' + paramKey"
      class="pa-2"
      hide-details
      :value="RusDateFormat(paramData.value)"
      v-model="paramData.value"
      :label="paramData.key.text"
      hint="ГГГГ-ММ-ДД"
      persistent-hint
      prepend-icon="mdi-calendar"
      :autofocus=" paramKey === 1 ? true : false"
      :disabled="paramData.key.readonly ? true : false"
      type="date"
    ></v-text-field>
  </div>
</template>

<script lang="ts">
import {Component, Prop, Vue} from 'vue-property-decorator'
import moment from "moment";

@Component({
  components: { },
})

export default class ParamDate extends Vue{

  @Prop() paramData : any
  @Prop() paramKey : any

  RusDateFormat(item: any) : any {
    return (item !== null && item !== '') ? moment(item, 'YYYY-MM-DD').format('DD.MM.YYYY') : ''
  }

}

</script>

<style scoped>

</style>