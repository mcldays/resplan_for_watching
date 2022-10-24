<!--Автор: Волков Максим-->
<!--Комментарий: простой бар, в будущем возможно будут добавлены группы кнопок-->
<template>
  <div style="height:100%;display:flex">
    <v-btn icon
           :depressed="false"
           center
           @click="addAction"
    >
      <v-icon
          small
      >
        mdi-plus
      </v-icon>
    </v-btn>

    <v-btn icon
           :depressed="true"
           center
           @click="editAction">
      <v-icon
          small
      >
        mdi-pencil
      </v-icon>
    </v-btn>

    <v-btn icon
           :depressed="true"
           center
           @click="deleteAction">
      <v-icon
          small
      >
        mdi-delete
      </v-icon>
    </v-btn>
  </div>
</template>


<script lang="ts">

// импорты библиотек и компонентов
import {Component, Prop, Vue, Watch} from 'vue-property-decorator'
import {mixins} from "vue-class-component";
import {tableMixin} from "@/mixins/tableMixin";
import SelectTable from "@/ui/SelectTable.vue";
import EditCard from "@/ui/EditCard.vue";

// регистрация компонентов
@Component({
  components : {
    SelectTable,EditCard
  }
})
// описание класса компонента ComboPicker
export default class ActionBar extends mixins(tableMixin) {
  addAction():void{
    this.$emit("addEvent")
  }
  editAction():void{
    this.$emit("editEvent")
  }
  deleteAction():void{
    this.$emit("removeEvent")
  }
}

</script>

<style scoped>
.combo{
  width:fit-content
}
</style>