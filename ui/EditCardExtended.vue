<template>
  <div style="height: 100%">
    <v-sheet>
      <v-form ref="formCard">
        <v-card>
          <div class="grey lighten-3">
          </div>
          <v-card-text>
            <v-row>
<!--              Первая колонка-->
              <v-col>
            <div
                v-for="(field, key) in fieldsData"
                :key="key"
                class="editFields"
            >

              <div v-if="field.key.readonly === false" class="text">
                <div v-if="field.key.ref" class="text">
                  <v-autocomplete
                      hide-details
                      :label="field.key.text"
                      v-model="field.valueID"
                      :items="refModel(field)"

                      prepend-icon="mdi-book-open"
                      clearable
                      @click:clear="clearRef(key)"
                      @focus="init(field.key.value,field.key)"
                  >
                    <template v-slot:append-outer>
                      <v-btn @click="openSelectForm(field.key)" icon>
                        <v-icon>mdi-share-variant</v-icon>
                      </v-btn>
                    </template>
                  </v-autocomplete>
                </div>

                <div v-else-if="field.key.type==='datetime'" class="text">
                  <v-menu
                      ref="field.value"
                      v-model="contexMenu[key]"
                      :close-on-content-click="false"
                      transition="scale-transition"
                      offset-y
                      max-width="290px"
                      min-width="auto"
                  >
                    <template v-slot:activator="{ on, attrs }">
                      <v-text-field
                          :ref="'datefield' + key"
                          class="pa-2"
                          hide-details
                          :value="RusDateFormat(field.value)"
                          v-model="field.value"
                          :label="field.key.text"
                          hint="ГГГГ-ММ-ДД"
                          persistent-hint
                          prepend-icon="mdi-calendar"
                          v-bind="attrs"
                          v-on="on"
                          :autofocus=" key === 1 ? true : false"
                          :disabled="field.key.readonly ? true : false"
                          type="date"
                      ></v-text-field>
                    </template>
                    <!--<v-date-picker
                      @input="contexMenu[key] = false"
                      v-model="field.value"
                      no-title
                    ></v-date-picker> -->
                  </v-menu>
                </div>

                <div v-else-if="['int','smallint','decimal','money'].includes(field.key.type)" class="text">
                  <v-text-field
                      ref="field.key.value"
                      class="pa-2"
                      hide-details
                      :label="field.key.text"
                      v-model="field.value"
                      :autofocus=" key === 1 ? true : false"
                      prepend-icon="mdi-numeric"
                      :disabled="field.key.readonly ? true : false"
                      type="number"
                      required
                  ></v-text-field>
                  <!-- :rules="[(v)=>Number.isInteger(Number(v)) || 'значение поля должно быть числовым']" -->
                </div>
                <div v-else-if="field.key.type==='bit'" class="text">
                  <v-checkbox
                      ref="field.key.value"
                      class="ma-2"
                      :label="field.key.text"
                      prepend-icon="mdi-check"
                      :disabled="field.key.readonly ? true : false"
                      v-model="checkedItems"
                      :value="field.key.value"
                      required
                      @change="check(key)"
                  ></v-checkbox>
                </div>
                <div v-else class="text">
                  <v-textarea
                      ref="field.key.value"
                      outlined
                      hide-spin-buttons
                      rows="1"
                      auto-grow

                      class="pa-2"
                      hide-details
                      :label="field.key.text"
                      v-model="field.value"
                      :autofocus=" key === 1 ? true : false"
                      prepend-icon="mdi-pencil-outline"
                      :disabled="field.key.readonly ? true : false"
                  ></v-textarea>
                </div>
              </div>
            </div>
              </v-col>
<!--              Вторая колонка-->
              <v-col>
                <div
                    v-for="(field, key) in fieldsDataTwo"
                    :key="key"
                    class="editFields"
                >

                  <div v-if="field.key.readonly === false" class="text">
                    <div v-if="field.key.ref" class="text">
                      <v-autocomplete
                          hide-details
                          :label="field.key.text"
                          v-model="field.valueID"
                          :items="refModel(field)"
                          prepend-icon="mdi-book-open"
                          clearable
                          @click:clear="clearRef(key)"
                          @focus="init(field.key.value,field.key)"
                      >
                        <template v-slot:append-outer>
                          <v-btn @click="openSelectForm(field.key)" icon>
                            <v-icon>mdi-share-variant</v-icon>
                          </v-btn>
                        </template>
                      </v-autocomplete>
                    </div>

                    <div v-else-if="field.key.type==='datetime'" class="text">
                      <v-menu
                          ref="field.value"
                          v-model="contexMenu[key]"
                          :close-on-content-click="false"
                          transition="scale-transition"
                          offset-y
                          max-width="290px"
                          min-width="auto"
                      >
                        <template v-slot:activator="{ on, attrs }">
                          <v-text-field
                              :ref="'datefield' + key"
                              class="pa-2"
                              hide-details
                              :value="RusDateFormat(field.value)"
                              v-model="field.value"
                              :label="field.key.text"
                              hint="ГГГГ-ММ-ДД"
                              persistent-hint
                              prepend-icon="mdi-calendar"
                              v-bind="attrs"
                              v-on="on"
                              :autofocus=" key === 1 ? true : false"
                              :disabled="field.key.readonly ? true : false"
                              type="date"
                          ></v-text-field>
                        </template>
                        <!--<v-date-picker
                          @input="contexMenu[key] = false"
                          v-model="field.value"
                          no-title
                        ></v-date-picker> -->
                      </v-menu>
                    </div>

                    <div v-else-if="['int','smallint','decimal','money'].includes(field.key.type)" class="text">
                      <v-text-field
                          ref="field.key.value"
                          class="pa-2"
                          hide-details
                          :label="field.key.text"
                          v-model="field.value"
                          :autofocus=" key === 1 ? true : false"
                          prepend-icon="mdi-numeric"
                          :disabled="field.key.readonly ? true : false"
                          type="number"
                          required
                      ></v-text-field>
                      <!-- :rules="[(v)=>Number.isInteger(Number(v)) || 'значение поля должно быть числовым']" -->
                    </div>
                    <div v-else-if="field.key.type==='bit'" class="text">
                      <v-checkbox
                          ref="field.key.value"
                          class="ma-2"
                          :label="field.key.text"
                          prepend-icon="mdi-check"
                          :disabled="field.key.readonly ? true : false"
                          v-model="checkedItems"
                          :value="field.key.value"
                          required
                          @change="check(key)"
                      ></v-checkbox>
                    </div>
                    <div v-else class="text">
                      <v-textarea
                          ref="field.key.value"
                          outlined
                          hide-spin-buttons
                          rows="1"
                          auto-grow

                          class="pa-2"
                          hide-details
                          :label="field.key.text"
                          v-model="field.value"
                          :autofocus=" key === 1 ? true : false"
                          prepend-icon="mdi-pencil-outline"
                          :disabled="field.key.readonly ? true : false"
                      ></v-textarea>
                    </div>
                  </div>
                </div>
              </v-col>
            </v-row>




            <div style="display: flex; padding: 5px">
<!--              <v-btn depressed color="error" @click="closeCard(false)">Отменить</v-btn>-->
              <v-spacer>
                <div v-if="!this.canSave">
                  Нельзя сохранить с ошибками
                </div>
              </v-spacer>
              <v-btn depressed color="primary" @click="saveChanges">{{returnBack?'Применить':'Сохранить'}}</v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-form>

      <v-dialog
          v-model="dialog"
          v-if="dialog"
          width="1500px"

      >
        <select-table
            :headers="this.headersForDialog"
            :table-data="this.dataForDialog"
            :isTree="this.dialogIsTree"
            :dbName="this.dialogDBName"
            @chosenRow="addDataFromDialog"
        ></select-table>
      </v-dialog>
    </v-sheet>
  </div>
</template>

<script lang="ts">
import {Component, Prop, Vue, Watch} from 'vue-property-decorator'
import {TableDataModel, Header} from "@/models/TableDataModel";
import {baseController} from "@/controllers/baseController";
import SelectTable from "@/ui/SelectTable.vue";
import {mixins} from "vue-class-component";
import {tableMixin} from "@/mixins/tableMixin";
import moment from "moment"


@Component({
  components: {
    SelectTable
  },

})
export default class EditCardExtended extends mixins(tableMixin) {
  @Prop() headers: Header[]
  @Prop() data: string[]
  //Флаг определяющий в каком режиме находится карточка, создание новой записи или редактирования
  @Prop() forEdit: boolean
  //Вернуть запись обратно, или сохранить в базе
  @Prop({default:false}) returnBack: boolean
  //Список дефолтных значений
  @Prop() defaultRow: any[]
  @Prop({default : ""}) tableNameProp : string
  @Prop({default : false}) isExtended : boolean

  private dialogName = 'Редактирование сущности'
  private tableName = ""
  private fieldsData : any[] = []
  private fieldsDataTwo : any[] = []
  private dialog = false
  private dataForDialog: any[] = []
  private headersForDialog: any[] = []
  private dialogIsTree = false
  private dialogDBName: any
  private chosenHead: any
  private index = 0
  private contexMenu = []
  private canSave = true
  private checkedItems: any[] = []
  private items: any[] = []



  @Watch('headers', {deep:true})
   prepareDataForEdit() {
    const firstRes = this.headers.find((el)=>el.value==="fkey")
    this.dialogName = firstRes === undefined ? "" : String(firstRes.tblNameCirilic)
    this.tableName = this.tableName = firstRes === undefined ? "" : String(firstRes.tblName)
    let result: any[] = this.convertToKeyValuePair(this.headers, this.data)

    //console.log("this.defaultRow",this.defaultRow)
    if (this.defaultRow !== undefined) {
      this.defaultRow.forEach((el)=> {
        const res = result.find((t)=>t.key.value === el.key)
        if (res !== undefined) {
          res.value = el.value
          if (res.key.ref === true) res.valueID = el.value
        }
      })
    }

    //console.log("result",result)
    // в массив записываются названия полей, у которых надо поставить галочку в v-checkbox
    for (const res of result)
    {
      if (res.key.type === 'bit' && res.value === "True")
        this.checkedItems.push(res.key.value)
    }

    result.filter(t => t.key.ref == true).map(async function (el) {
      if (el.value !== '')
      {
        let request = await baseController.getRelValue(el.key.value, el.value)
        el.value = request.data[1].fName
      }
    })

    this.fieldsData = result
    console.log(this.fieldsData,"Fields Data in Extended")
    this.colRestruct(this.fieldsData)


    //console.log("this.headers",this.headers)
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

  async openSelectForm(head: any) {
    this.dialog = true
    this.chosenHead = head

    //проверка на дерево ли это или плоский список
    this.dialogDBName = head.value.substring(0,2)==='f_' ? head.value.substring(2,head.value.length) : head.value
    const tableNameResult = await baseController.GetDist()
    const tableNames: any[] = tableNameResult.data
    const curTable = tableNames.find(t => t.fName === this.dialogDBName)
    this.dialogIsTree = curTable?.fisTree === "True"
    //console.log("this.dialogIsTree",this.dialogIsTree)

    //Если не дерево то подготавливаем для него данные
    if (!this.dialogIsTree) {
      let result = await baseController.getRelValue(head.value, 0)
      let parsed = this.preparedDataToTable(result)
      this.dataForDialog = parsed.valuesTable
      this.headersForDialog = parsed.headersTable
    }
  }

  refModel(field: any): any {
    const selectedItem = this.items.filter((el: any) => el.id == field.key.value)
    return selectedItem.length > 0 ? selectedItem[0].value : [{text:field.value, value: field.valueID}]
  }

  addDataFromDialog(item: any) {
    this.fieldsData.filter(t => t.key == this.chosenHead).map(function (el) {
      el.value = item.fName
      el.valueID = item.fkey
    })
    this.dialog = false
  }

  RusDateFormat(item: any) : any {
    return (item !== null && item !== '') ? moment(item, 'YYYY-MM-DD').format('DD.MM.YYYY') : ''
  }

  clearRef(key:any) {
    //console.log("item",key)
    this.fieldsData[key].valueID = 0
  }

  validateItems() {
    this.canSave = (this.$refs["formCard"] as any).validate()
  }

  async saveChanges() {
    let resultArray = this.fieldsData.concat(this.fieldsDataTwo)
      if(!this.isExtended){
        let model: any = {}
        model["tblName"] = this.tableName
        //console.log("fieldsData",this.fieldsData)
        for (const fieldsDatum of resultArray) {
          // eslint-disable-next-line no-prototype-builtins
          //Поля с текстовым значением ссыллок не сохраняем
          if (fieldsDatum.key.refName == undefined)
          {
            if (fieldsDatum.valueID != undefined) {
              //console.log(fieldsDatum.key.value,fieldsDatum.valueID)
              model[fieldsDatum.key.value] = fieldsDatum.valueID
            } else {
              model[fieldsDatum.key.value] = fieldsDatum.key.type==='datetime' ? this.RusDateFormat(fieldsDatum.value) : fieldsDatum.value
            }
          }
        }
        //console.log("model",model)

        let insertResult = ""
        //Если надо просто вернуть запись, то не сохраняем ее в базе
        if (this.returnBack) { insertResult = model }
        else { insertResult = await baseController.applyTableChanges([model]) }
        this.closeCard(true,insertResult)
      }
      this.$emit('updateReport', resultArray)



  }

  closeCard(needUpate:any, insertResult:any):any {
    if (needUpate) this.$emit("needUpdateCard", insertResult)
    this.$emit("closed", insertResult)
  }

  check(key:any){
    this.fieldsData[key].value = this.checkedItems.includes(this.fieldsData[key].key.value)
  }

  async init(_id:any, head: any){
    if (this.items.filter(el => el.id == _id ).length == 0) {
      let rs = await baseController.getRelValue(head.value, 0)
      let parsed = this.preparedDataToTable(rs)
      this.items.push({ id:_id, value:parsed.valuesTable.map(t => {
          const itm:any = {}
          itm.value = t.fkey
          itm.text = t.fName
          return itm
        })
      })
    }
  }

  goBack(){
    this.$emit("back")
  }

}
</script>

<style scoped>

</style>