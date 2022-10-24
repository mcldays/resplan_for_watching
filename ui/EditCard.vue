<template>
  <div style="height: 100%">
    <v-sheet>

        <v-card>
          <div style="position: sticky; top:0; z-index: 999;">
            <v-card-title v-if="!isExtended">{{ ( returnBack ? 'Введите параметры отчета' : forEdit?'Редактировать запись: ':'Добавить запись: ') + this.dialogName }}</v-card-title>
            <v-divider></v-divider>
          </div>
          <v-card-text>
            <v-form ref="formCard">
            <v-row>
            <v-col>
              <ParamsCol
              :fields-data="fieldsData"
              :table-name="tableName"
              :primary-key="primaryKey"
              :return-back="returnBack"
              @setNewFile="setNewFile"
              />

              </v-col>
              <!--              Вторая колонка-->
              <v-col v-if="isExtended">
                <ParamsCol
                    :fields-data="fieldsDataTwo"
                    :table-name="tableName"
                    :primary-key="primaryKey"
                    :return-back="returnBack"
                    @setNewFile="setNewFile"
                />
              </v-col>
            </v-row>
            </v-form>
          </v-card-text>
          <div style="display: flex; position: sticky; bottom: 0;" class="pa-6">
            <v-btn depressed color="error" @click="closeCard(false)">Отменить</v-btn>
            <v-spacer>
              <div v-if="!this.canSave">
                Нельзя сохранить с ошибками
              </div>
            </v-spacer>
            <v-btn type="submit" depressed color="primary" @click="saveChanges">{{returnBack?'Применить':'Сохранить'}}</v-btn>
          </div>
        </v-card>

    </v-sheet>
  </div>
</template>

<script lang="ts">
import {Component, Prop, Vue, Watch} from 'vue-property-decorator'
import {Header} from "@/models/TableDataModel";
import {baseController} from "@/controllers/baseController";
import {mixins} from "vue-class-component";
import {tableMixin} from "@/mixins/tableMixin";
import moment from "moment";
import ParamsCol from "@/ui/elements/ParamsCol.vue";

@Component({
  components: { ParamsCol },
})

export default class EditCard extends mixins(tableMixin) {
  @Prop() headers: Header[]
  @Prop() data: string[]
  //Флаг определяющий в каком режиме находится карточка, создание новой записи или редактирования
  @Prop() forEdit: boolean
  //Вернуть запись обратно, или сохранить в базе
  @Prop({default:false}) returnBack: boolean
  //Список дефолтных значений
  @Prop() defaultRow: any[]
  @Prop({default : false}) isExtended : boolean
  @Prop({default : false}) isReport : boolean

  private dialogName = 'Редактирование сущности'
  private tableName = ""
  private fieldsData: any[] = []
  private fieldsDataTwo : any[] = []
  private canSave = true
  private newFile: any = undefined
  private formData: FormData = new FormData()
  private primaryKey = 0

  created(){
    if(!this.isExtended){
      this.prepareData()
    }
  }

@Watch('data', {deep : true})
  async prepareData() {
    const firstRes = this.headers.find((el)=>el.value==="fkey")
    this.dialogName = firstRes === undefined ? "" : String(firstRes.tblNameCirilic)
    this.tableName = firstRes === undefined ? "" : String(firstRes.tblName)
    this.primaryKey = this.data == undefined ? 0 : parseInt(this.data[0] === "" ? "0" : this.data[0])

    let result: any[] = this.convertToKeyValuePair(this.headers, this.data)

    //Заполняем дефолтные значения в карточку
    if (this.defaultRow !== undefined) {
      this.defaultRow.forEach((el)=> {
        const res = result.find((t)=>t.key.value === el.key)
        if (res !== undefined && res !== null && el.value > 0) { 
            res.value = el.value
            if (res.key.ref === true ) res.valueID = el.value
          }
      })
    }

    this.fieldsData = result
   if(this.isExtended){
     this.colRestruct(this.fieldsData)
   }
    
  }

  colRestruct(field : any[]){
    let count  = field.length
    let colCount
    if(count%2 == 0){
      colCount = count/2
    }
    else{
      colCount = Math.floor(count/2)
    }
    this.fieldsDataTwo = this.fieldsData.splice(colCount)
    //console.log(this.fieldsDataTwo)
    //console.log(this.fieldsData)
  }

  validateItems() {
    this.canSave = (this.$refs["formCard"] as any).validate()
  }

  async saveChanges() {

    let resultArray = this.fieldsData.concat(this.fieldsDataTwo)
    if(!this.isReport){
      let model: any = {}
      model["tblName"] = this.tableName
      //console.log("this.fieldsData",this.fieldsData)
      for (const fieldsDatum of resultArray) {
        //Если поле только для чтения то его и не надо закидывать на сохранение
        if (fieldsDatum.key.readonly === false || fieldsDatum.key.value === 'fkey') {
          // eslint-disable-next-line no-prototype-builtins
          //Поля с текстовым значением ссыллок не сохраняем
          if (fieldsDatum.key.refName == undefined && fieldsDatum.key.type != 'image')
          {
            if (fieldsDatum.valueID === undefined) {
              model[fieldsDatum.key.value] = fieldsDatum.key.type==='datetime' ? this.RusDateFormat(fieldsDatum.value) : fieldsDatum.value
            } else {
              model[fieldsDatum.key.value] = fieldsDatum.valueID
            }
          }
        }
      }
      //console.log("model",model)

      let insertResult: any
      //Если надо просто вернуть запись, то не сохраняем ее в базе
      if (this.returnBack) { insertResult = model }
      else {
        insertResult = await baseController.applyTableChanges([model])
        if (this.newFile) {
          const cur_key = model.fkey > 0 ? model.fkey : insertResult['data']
          baseController.setFileFromTable(cur_key, this.formData)
        }
      }
      this.closeCard(true,insertResult)
    }
    this.$emit('updateReport', resultArray)
  }

  closeCard(needUpate:any, insertResult:any):any {
    if (needUpate) this.$emit("needUpdateCard", insertResult)
    this.$emit("closed", insertResult)
  }

  setNewFile (item:any, inp_formData: any) {
    this.newFile = item
    this.formData = inp_formData
  }

  RusDateFormat(item: any) : any {
    return (item !== null && item !== '') ? moment(item, 'YYYY-MM-DD').format('DD.MM.YYYY') : ''
  }

}
</script>

<style scoped>

</style>