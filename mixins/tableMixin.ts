import {Component, Prop, Vue, Watch} from 'vue-property-decorator'
import {Header} from "@/models/TableDataModel";
import { VAutocomplete } from 'vuetify/lib';
import moment from 'moment';

@Component
export class tableMixin extends Vue {
    //Конвертация в апи для таблицы
    preparedDataToTable(dataTable: any) {
        const headersTable: Header[] = []
        const [headers, ...data] = dataTable.data as any[]
        const valuesTable = data
        const keys = {text: Object.values(headers) as any[], value: Object.keys(headers) as any[]}
        for (let i = 0; i < keys.text.length; i++) {
            headersTable.push({
                text: keys.text[i].name, 
                value: keys.value[i],
                ref: keys.text[i].ref === undefined ? false : JSON.parse(keys.text[i].ref), 
                visible: keys.text[i].visible === undefined ? true : JSON.parse(keys.text[i].visible),
                readonly: keys.text[i].readonly === undefined ? false : JSON.parse(keys.text[i].readonly),
                refName: keys.text[i].refName,
                tblName : keys.text[i].tblName,
                tblNameCirilic : keys.text[i].tblNameCirilic,
                type : keys.text[i].type === undefined ? "varchar" : keys.text[i].type,
                //align : keys.text[i].visible === undefined ? " d-none" : JSON.parse(keys.text[i].visible)? "start" : " d-none",
            })
        }
        return {headersTable, valuesTable}
    }
    //Получить только заголовки
    preparedNamesTable(dataNames: any) {
        const [headers, ...names] = dataNames.data as any[]
        return names
    }
    //Получаем пару ключ значение
    convertToKeyValuePair(keys: any[], values: any[]) {
        const keyValuePair = []
        for (let i = 0; i < keys.length; i++) {
            const curValue = (values == undefined ? '' : 
                (String(keys[i].type) === "datetime") ? 
                    values[i] === '' ? '' : moment(values[i], 'DD.MM.YYYY').format('YYYY-MM-DD')
                    : values[i])
            if (Boolean(keys[i].ref) == true) {
                keyValuePair.push({key: keys[i], value: curValue, valueID: curValue})
            } else {
                keyValuePair.push({key: keys[i], value: curValue})
            }
        }
        return keyValuePair
    }
    //Парс скрытых значений в таблице
    parseAttributesOnTable(headers: Header[], data: any[]) {
        const hiddenValues: string[] = []
        const hiddenData = []

        const filteredHeaders = headers.filter(function (el) {
            if (el.visible == true) {
                hiddenValues.push(el.value)
                return el.value
            }
        })
        for (const localDatum of data) {
            const keys = Object.keys(localDatum)
            const values = Object.values(localDatum)
            const newData: any = {}
            for (let i = 0; i < keys.length; i++) {
                for (let j = 0; j < hiddenValues.length; j++) {
                    if (keys[i] == hiddenValues[j]) {
                        newData[keys[i]] = values[i]
                    }
                }
            }
            hiddenData.push(newData)
        }
        return {filteredHeaders, hiddenData}
    }

    //Генерим дефолтную строку
    generateDefaultRow(head: Header[], defaultValues: any[]) {
        const DefaultRow : any[] = []

        console.log("head",head)
        console.log("defaultValues",defaultValues)
        
        for (let i = 0; i < head.length; i++) {
            
            const DefValue = defaultValues.find((el)=>el.key===head[i].value)
            console.log("DefValue",DefValue)
            DefaultRow.push({key: head[i].value, value: DefValue !== undefined ? DefValue[0].value:''})

        }

        console.log("DefaultRow",DefaultRow)

        return DefaultRow
    }

    //Получить список полей для отображения в виде чекбоксов
    getCheckBoxColumns(headers: Header[]) {
        const checkBoxColumns: string[] = []

        const filteredHeaders = headers.filter(function (el) {
            if (el.type === 'bit') {
                checkBoxColumns.push(el.value)
                return el.value
            }
        })

        return checkBoxColumns
    }

    //Получить список полей для отображения в виде формата денег
    getMoneyColumns(headers: Header[]) {
        const MoneyColumns: string[] = []

        const filteredHeaders = headers.filter(function (el) {
            if (el.type === 'money') {
                MoneyColumns.push(el.value)
                return el.value
            }
        })

        return MoneyColumns
    }

    deepClone(object : any){
        const res = JSON.parse(JSON.stringify(object))
        return res
    }

     //Получить заголовки для параметров Отчета
     preparedParamHeaders(paramData: any) {        
        return paramData.map( (el:any) => {
            const isRef = el.fParam.slice(0,2) === 'f_';
            return ({ 
                text: el.fName,
                value: el.fParam,
                type: el.fType === null ? "varchar" : el.fType,
                readonly: false,
                ref: isRef,
                visible: true
            });} )
    }

    //Спрятать колонку добавлением свойства " d-none" к записи
    hideColumns(headreList: any, hideList: any) {
        headreList.forEach( (el: any) => {
            if (hideList.includes(el.value)) {
                el.align = " d-none"
                //el.visible = false
            }
        })
    }

}