<template>
<div>
  <div
      v-for="(field, key) in fieldsData"
      :key="key"
  >
    <div v-if="field.key.readonly === false">

      <div v-if="field.key.ref">
        <ParamReference :tableName="tableName" :paramData="field" :primaryKey="primaryKey"/>
      </div>

      <div v-else-if="field.key.type==='datetime'">
        <ParamDate :paramData="field" :paramKey="key"/>
      </div>

      <div v-else-if="field.key.type==='money'">
        <ParamMoney :paramData="field" :paramKey="key"/>
      </div>

      <div v-else-if="['int','smallint','decimal','money'].includes(field.key.type)">
        <ParamNumber :paramData="field" :paramKey="key"/>
      </div>

      <div v-else-if="field.key.type==='bit'">
        <ParamBoolean :paramData="field" :paramKey="key"/>
      </div>

      <div v-else-if="field.key.type==='image'">
        <ParamFile :paramData="field" :primaryKey="primaryKey" @setNewFile="setNewFile"/>
      </div>

      <div v-else-if="field.key.type==='list'">
        <ParamList :paramData="field" />
      </div>

      <div v-else class="text">
        <ParamString :paramData="field" :paramKey="key"/>
      </div>

    </div>
  </div>
</div>
</template>

<script lang="ts">
import {Vue,Component, Prop} from 'vue-property-decorator'
import ParamList from "@/ui/elements/ParamList.vue";
import ParamDate from "@/ui/elements/ParamDate.vue";
import ParamMoney from "@/ui/elements/ParamMoney.vue";
import ParamNumber from "@/ui/elements/ParamNumber.vue";
import ParamReference from "@/ui/elements/ParamReference.vue";
import ParamBoolean from "@/ui/elements/ParamBoolean.vue";
import ParamString from "@/ui/elements/ParamString.vue";
import ParamFile from "@/ui/elements/ParamFile.vue";
@Component({
components :{
  ParamList, ParamDate, ParamMoney, ParamNumber, ParamReference, ParamBoolean, ParamString, ParamFile, ParamsCol
}

})
export default class ParamsCol extends Vue {
  @Prop({default: () => []}) fieldsData: any[]
  @Prop({default: ""}) tableName: string
  @Prop({default : 0}) primaryKey : number
  @Prop({default : false}) isTwoColumns : boolean
  @Prop({default:false}) returnBack: boolean


  setNewFile (item:any, formData: any) {
    this.$emit("setNewFile", item, formData)
  }

}
</script>

<style scoped>

</style>