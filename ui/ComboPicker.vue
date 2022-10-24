<!--Автор: Волков Максим-->
<!--Комментарий: комбобокс с пикером из таблицы-->
<template>
  <div style="height:100%;display:flex" v-if="isShow">
    <v-container
        align-center
        justify-center
        row>
      <v-combobox
          class="combo"
          hide-details
          :label="labelName"
          :multiple="false"
          :items ="currComboItems"
          :item-text="currComboItems => currComboItems.fName"
          :clearable="true"
          :hide-selected="true"
          :loading="loading"
          :value="chosenItem"
          :return-object="true"
          @change="valueChanged"
          dense
          outlined
          loader-height="4px"
          :open-on-clear="true"
      >

      </v-combobox>
      <v-dialog
          v-model="dialog"
          max-width="1000px"
      >
        <BaseTable
            :table-data="localData"
            :headers="localHeaders"
            :toolbar-vision="true"
            :control-button-vision="false"
            @navigateDeep="addValueFromDialog"
            table-name="Кликните на строку для выбора"
        />

      </v-dialog>

      <v-btn
          @click="openSelectDialog()"
          icon
      >
        <v-icon>
          mdi-share-variant
        </v-icon>
      </v-btn>

    </v-container>
  </div>
</template>


<script lang="ts">

// импорты библиотек и компонентов
import {Component, Prop, Vue, Watch} from 'vue-property-decorator'
import {mixins} from "vue-class-component";
import {tableMixin} from "@/mixins/tableMixin";
import SelectTable from "@/ui/SelectTable.vue";
import {baseController} from "@/controllers/baseController";
import {Header} from "@/models/TableDataModel";
import BaseTable from "@/ui/BaseTable.vue";

// регистрация компонентов
@Component({
  components : {
    SelectTable, BaseTable
  }
})
// описание класса компонента ComboPicker
export default class ComboPicker extends mixins(tableMixin) {
  // имя для comboBox
  @Prop() labelName: string
  // имя таблицы, которая будет отображаться по нажатию кнопки в диалоге
  @Prop({ default: "" }) tableName: string
  // признак для отображения comboBox, по умолчанию true
  @Prop({ default: true }) isShow: boolean
  // устанавливает comboBox в определенное значение (можно передать любой массив, главное, чтобы был fName)
  @Prop() selectedItem: any
  // передача собственных значений для списка комбобокс
  @Prop() myComboItems: any[]
  // доступен ли комбобокс для редактирования
  @Prop({ default: false }) isReadonly: boolean
  // передача своих headers(если не передается имя таблицы)
  @Prop() myHeaders: Header[]

  // переменная для управления диалогом
  private dialog = false
  // данные для таблицы в диалоге
  private localData: any[] = []
  // заголовки для таблицы в диалоге
  private localHeaders: Header[] = []
  // переменная для хранения текущего значения comboBox
  private chosenItem: any = ""
  // переменная для хранения списка comboBox
  private currComboItems: any[] = []
  // переменная для отображения загрузки списка
  private loading = false

  created():void{
    this.checkHasItem();
    this.checkHasAnotherItems();
    // если не передается свой список значений, по умолчанию выводятся все по getTable()
    (this.myComboItems === undefined)? this.preparedDataForCombo(): undefined
    this.loading = true;
  }

  @Watch("selectedItem", {deep: true})
  checkHasItem():void{
    if (this.selectedItem !== undefined){
      this.chosenItem = this.selectedItem
      this.valueChanged(this.chosenItem)
    }
  }

  // передаем полученную коллекцию, если она есть
  @Watch("myComboItems", {deep: true})
  checkHasAnotherItems():void{
    (this.myComboItems !== undefined)? this.currComboItems = this.myComboItems: undefined
  }

  // событие загрузки
  @Watch("currComboItems", {deep: true})
  loadingState():void{
    // progressBar для comboBox
    if (this.currComboItems.length){
      setTimeout(() => {
        this.loading = false
      }, 1000);
    }
  }
  // подготовка данных для сomboBox, нужный список заполняется на основе имени таблицы
  async preparedDataForCombo() : Promise<void> {
    if (this.tableName !== ""){
      let dataForCombo = await baseController.GetTable(this.tableName)
      let result = this.preparedDataToTable(dataForCombo)

      this.currComboItems = result.valuesTable
    }
    // вырубаем анимацию загрузки, если список был пуст
    this.currComboItems.length === 0? setTimeout(() => {this.loading = false}, 1000): undefined
  }

  // событие изменения значения в comboBox, в item приходит измененное значение
  valueChanged(item: any) :void{
    this.$emit("valueChanged", item)
  }

  // обработка диалога
  async openSelectDialog() :Promise<void>{
    if (this.tableName !== ""){
      // открываем диалог
      this.dialog = true
      // получаем данные для таблицы в диалоге по имени таблицы
      let dataTable = await baseController.GetTable(this.tableName)
      let result = this.preparedDataToTable(dataTable)

      this.localData = result.valuesTable
      this.localHeaders = result.headersTable
    }
    else {
      if (this.myHeaders.length && this.currComboItems.length) {

        let result2 = this.parseAttributesOnTable(this.myHeaders, this.currComboItems)
        this.localData = this.currComboItems
        this.localHeaders = this.myHeaders

        // открываем диалог
        this.dialog = true
      }
    }
  }

  // событие выбора значения в диалоговой таблице и запись значения в comboBox
  async addValueFromDialog(item: any) :Promise<void>{

    console.log("itemD",item)
    // сохраняем в переменную выбранную строку таблицы
    this.chosenItem = item
    console.log("this",this.chosenItem)
    // программно вызываем изменение
    await this.valueChanged(this.chosenItem)

    // закрываем диалог
    this.dialog = false
  }
}

</script>

<style scoped>
  .combo{
    width:fit-content
  }
</style>