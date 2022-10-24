<template>
  <div>
    <div style="display:flex;" >
        <div style="width:30%;">
        <BaseTable
            :table-data="this.specDT"
            :headers="this.specHeader"
            table-name='Спецификация договора'
            @navigateDeep="rowClickedSpec"
            :itemsPerPage = -1
        />
        </div>
        <v-divider style="margin:15px;height:0px" vertical/>
        <v-slide-x-transition>
            <div style="width:70%;" v-if="nakladState">
                <v-data-table
                    dense
                    v-model="naklSelected"
                    :items-per-page=-1
                    :headers="this.nakladHeader"
                    :items="this.nakladDT"
                    item-key="fkey"
                    @click:row="rowClickedNaklad"
                    show-select
                    height="90vh"
                    :hide-default-footer="true"
                >
                </v-data-table>
            </div>
        </v-slide-x-transition>
    </div>
    

  </div>
</template>

<script lang="ts">
import {Component} from 'vue-property-decorator'
import BaseTable from "@/ui/BaseTable.vue";
import {Header} from "@/models/TableDataModel";
import {contractsController} from "@/controllers/contractsController";
import {mixins} from "vue-class-component";
import {tableMixin} from "@/mixins/tableMixin";


@Component({
  components: {BaseTable}
})
export default class vCotractRestrictResource extends mixins(tableMixin) {

    private specDT: any[] = []
    private specHeader: Header[] = []
    private nakladState = false
    private nakladDT: any[] = []
    private nakladHeader: Header[] = []
    private naklSelected: any[] = []

    private contractKey: any
    private specKey: any
    private lastSpec: any
    private lastMat: any

    async created() {
        await this.prepareSpecData()
        //console.log("nakladState",this.nakladState)
    }

    async beforeDestroy () {
        //console.log("destroyed")
        this.saveLinksToBase()
    }

    async prepareSpecData() {
        this.contractKey = this.$route.params.Pid
        let dataTable = await contractsController.GetContractsSpecSmall(0,this.contractKey)
        let result = this.preparedDataToTable(dataTable)
        this.specDT = result.valuesTable
        this.specHeader = result.headersTable
    }

    async saveLinksToBase() {
        //Сдесь сделать алерт или что то еще с проедложение сохранить данные
        const LinkKeys = this.naklSelected.length > 0 ? this.naklSelected.map((el)=>el.fkey).toString() : undefined
        if (LinkKeys !== undefined) {
            await contractsController.setLinkNaklad(this.specKey,LinkKeys)
        }
    }

    async prepareNakladData() {
        //save to base prev checked list
        this.saveLinksToBase()

        //refresh mat list
        this.specKey = this.lastSpec.fkey
        let dataTable = await contractsController.getContractNaklad(3, this.specKey)
        //console.log("dataTable",dataTable)
        if (dataTable.data.length > 1) {
            this.nakladState = true
            const result = this.preparedDataToTable(dataTable)
            this.nakladDT = result.valuesTable
            this.nakladHeader = result.headersTable
            this.naklSelected = this.nakladDT.filter((el)=>el.isChecked === "да")
            this.nakladHeader = this.nakladHeader.filter((el)=>el.value !== "isChecked")

            // вызываем анимацию
            if (this.nakladState){
            this.nakladState = false
            // имитация анимации
            setTimeout(() => {
                    this.nakladState = true
                }, 50);
            }

        }
    }

    rowClickedSpec(item : any) {
        this.lastSpec = item
        //this.nakladState = true
        this.prepareNakladData()
    }

    rowClickedNaklad(item : any) {      
        this.lastMat = item
    }

    async refreshData(TableType:any) {
        console.log("TableType",TableType)

    }



}
</script>

<style scoped>

</style>