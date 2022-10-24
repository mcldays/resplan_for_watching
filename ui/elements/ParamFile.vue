<template>
  <div>
    <v-file-input
        height="20px"
        class="pa-2"
        label="Добавить файл"
        outlined
        dense
        @change="onFilePicked"
    >
    <template v-slot:append-outer>
        <v-btn
          v-if="paramData.value"
          @click="downloadFile"
        >
          Посмотреть файл
        </v-btn>
      </template>
    </v-file-input>
  </div>
</template>

<script lang="ts">
import {Component, Prop, Vue} from 'vue-property-decorator';
import {baseController} from "@/controllers/baseController";

@Component({
  components: { },
})

export default class ParamFile extends Vue{

  @Prop() paramData: any
  @Prop() setNewFile: any
  @Prop() primaryKey: any

  private fileName = ""
  //private newFile: any = undefined

  onFilePicked(e:any){
    let reader = new FileReader();
    reader.readAsArrayBuffer(e)
    this.fileName = e.name
    reader.addEventListener('load', this.success)
  }

  success(resultBlob : any){
    let fileData = new Blob([new Uint8Array(resultBlob.target.result)])
    //this.newFile = fileData
    const formData: FormData = new FormData()
    formData.append('file',fileData,this.fileName)   
    this.$emit("setNewFile", fileData, formData)
  }

  async downloadFile(){
    if (this.primaryKey > 0) {
      await baseController.getFileFromTable(this.primaryKey)
    }
  }

}

</script>

<style scoped>

</style>