// @ts-ignore
import Axios, { AxiosPromise, AxiosResponse } from '/axios_settings';

export class techCardsController {
    // API-запрос для получения данных для таблицы ТехКарт
    public static async getTC( fkey?: number,
                               f_spObjectTypes?: number,
                               f_spTC?: number,
                               filter?: string){
        return Axios.get(`/DBContr/getTC?fkey=${fkey}
                         &f_spObjectTypes=${f_spObjectTypes}
                         &f_spTC=${f_spTC}
                         &filter=${filter}`)
    }
    // API-запрос для получения данных для таблицы Операций
    public static async getTC_Opers( fkey?: number,
                                     f_spTC?: number){
        return Axios.get(`/DBContr/getTC_Opers?fkey=${fkey}
                                         &f_spTC=${f_spTC}`)
    }

    // API-запрос для получения данных для таблицы Расходов
    public static async getTC_Spends( fkey?: number,
                                      f_spTC_Opers?: number,
                                      f_Variant?: number){
        return Axios.get(`/DBContr/getTC_Spends?fkey=${fkey}
                                         &f_spTC_Opers=${f_spTC_Opers}
                                         &f_Variant=${f_Variant}`)
    }

    // API-запрос для получения вариантов для расходов
    public static async getTC_Spends_Variants(f_spTC_Opers?: number){
        return Axios.get(`/DBContr/getTC_Spends_Variants?f_spTC_Opers=${f_spTC_Opers}`)
    }

    // API-запрос для получения дерева классификатора работ
    public static async getWorks(f_spWorkLevels?: number,
                                 f_spWorks?: number){
        return Axios.get(`/DBContr/getWorks?f_spWorkLevels=${f_spWorkLevels}&f_spWorks=${f_spWorks}`)
    }

    // API-запрос для получения дерева классификатора работ
    public static async getTreeBranch(table?: string, parent?: number){
    return Axios.get(`/DBContr/getTreeBranch?table=${table}&parent=${parent}`)
    }

    // API-запрос для получения дерева элементов для v-breadCrumbs
    public static async getWorkPath(f_spWorks?: number){
        return Axios.get(`/DBContr/getWorkPath?f_spWorks=${f_spWorks}`)
    }

    // API-запрос для получения дерева элементов для v-treeView
    public static async getWorkTreeJson(){
        return Axios.get("/DBContr/getWorkTreeJson")
    }
}