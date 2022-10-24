<template>
  <div>
    <v-card>    
      <v-card-text>
        <div style="display:flex;">
          <div class="mx-5" style="display:flex;flex-direction: column;width: 20%">
            <v-progress-linear
              class="ma-2"
              color="deep-purple accent-4"
              :indeterminate="importActive"
              rounded
              :hidden="!importActive"
              height="6"/>
            <strong class="ma-5">Системы Учета Трудозатрат ( СУТ )</strong>
            <v-btn class="ma-2"  color="deep-purple" text outlined @click="exportSUT" :disabled="importActive"> 
              <v-icon class="mx-2" style="size:8px" color="black">mdi-backburger</v-icon>
              Экспорт данных в СУТ
            </v-btn>
            <v-btn class="ma-2" color="deep-purple" text outlined @click="importSUT" :disabled="importActive"> 
              <v-icon class="mx-2" style="size:8px" color="black">mdi-forwardburger</v-icon>
              Импорт данных из СУТ
            </v-btn>
            <strong class="ma-5">1C ( ЕКШ )</strong>
            <v-btn class="ma-2"  color="deep-purple" text outlined @click="import1C" :disabled="importActive"> 
              <v-icon class="mx-2" style="size:8px" color="black">mdi-forwardburger</v-icon>
              Импорт данных из 1C
            </v-btn>
          </div>
          <div style="width: 80%">
            <v-textarea 
              outlined 
              label="Лог импорта:" 
              v-model="importLog"
              readonly
              height="550px"/>
          </div>
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>


<script lang="ts">
import {Component, Prop} from 'vue-property-decorator'
import {mixins} from "vue-class-component";
import {tableMixin} from "@/mixins/tableMixin";


@Component({
  components: { }
})
export default class ImportForm extends mixins(tableMixin) {

  private importLog = ""
  private importActive = false
  logImportEvents = [
    { type: "", timeout: 1000, text: "Устанавливаем соединение...", textEnd: "установлено" },
    { type: "import", timeout: 1000, text: "Запрос во внешную систему...", textEnd: "завершен" },
    { type: "import", timeout: 1500, text: "Получение данных...", textEnd: "завершено" },
    { type: "import", timeout: 1000, text: "Сохранение данных в базе данных...", textEnd: "сохранено" },
    { type: "import", timeout: 1000, text: "Импорт завершен.", textEnd: " Соединене закрыто.\n\n" },
    { type: "export", timeout: 1500, text: "Формирование пакета данных для отправки...", textEnd: "сформировано" },
    { type: "export", timeout: 2000, text: "Отправка данных...", textEnd: "завершено" },
    { type: "export", timeout: 1000, text: "Экспорт завершен.", textEnd: " Соединене закрыто.\n\n" },
    { type: "import1c", timeout: 1000, text: "Запрос во внешную систему 1С ЕКШ...", textEnd: "завершен" },
    { type: "import1c", timeout: 1500, text: "Получение данных персонала...", textEnd: "завершено" },
    { type: "import1c", timeout: 1000, text: "Сохранение данных персонала в базе данных...", textEnd: "сохранено" },
    { type: "import1c", timeout: 1000, text: "Корректировка штатного расписания в базе данных...", textEnd: "сохранено" },
    { type: "import1c", timeout: 1000, text: "Импорт персонала завершен.", textEnd: " Соединене закрыто.\n\n" },
  ]

  importSUT() {
    this.importEmitation("Импорт данных из СУТ","import")
  }

  exportSUT() {
    this.importEmitation("Экспорт данных в СУТ","export")
  }

  import1C() {
    this.importEmitation("Импорт данных из 1С","import1c")
  }

  importEmitation(titile:any, type:any) {
    this.importActive = true
    this.importLog += titile + ":\n";
    const logs = this.logImportEvents.filter((el:any) => el.type === type || el.type === '')
    this.getNextLog(logs,0)
  }

  getNextLog(logs:any, index:any) {
    if (logs.length > index) {
      this.importLog += logs[index].text;
      setTimeout(() => {
        this.importLog += logs[index].textEnd + "\n";
        this.getNextLog(logs,index+1)
      }, logs[index].timeout)
    } else {
      this.importActive = false
    }
  }

}
</script>

<style scoped>

</style>