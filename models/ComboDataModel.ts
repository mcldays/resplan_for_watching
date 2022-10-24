// модель данных для связанных comboBox
import {Header} from "@/models/TableDataModel";

export class ComboDataModel {
    // пока просто имя
    name: string
    // уровень в иерархии
    level: number
    // текущий список значений comboBox
    comboList: any[];
    // весь список возможных значений comboBox
    allData: any[]
    // значение фильтра
    filter: number
    // заголовки для таблицы
    myHeader?: Header[];
// { name:string, f_spWorkLevels:number,comboList: any[], allData: any[], filter:number}
    constructor(names: string,
                levels: number,
                comboLists: any[],
                allDatas: any[],
                filters: number,
                myHeaders?: Header[]) {
        this.name = names
        this.level = levels
        this.comboList = comboLists
        this.allData = allDatas
        this.filter = filters
        this.myHeader = myHeaders
    }
}

