<template>
  <v-sheet rounded="lg">
    <v-list color="transparent">
      <v-list-item
          v-for="(n,key) in this.leftMenu"
          :key="key"
          link
      >
        <v-list-item-content>
          <v-list-item-title>
            {{ n.name }}
          </v-list-item-title>
        </v-list-item-content>
      </v-list-item>

      <v-divider class="my-2"></v-divider>

      <v-list-item
          link
          color="grey lighten-4"
      >
        <v-list-item-content>
          <v-list-item-title>
            Обновить
          </v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </v-list>
  </v-sheet>
</template>

<script lang="ts">
import {Component, Prop, Vue, Watch} from 'vue-property-decorator'
@Component({
  components : {

  }
})
export default class LeftMenu extends Vue  {

}
</script>

<style scoped>

</style>