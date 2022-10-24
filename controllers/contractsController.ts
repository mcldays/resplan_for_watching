// @ts-ignore
import Axios, { AxiosPromise, AxiosResponse } from '/axios_settings';

export class contractsController {

    public static async GetAll(){
        return await Axios.get("/DBContr/getContracts")
    }
    
    public static async GetContractsSpec(fkey : number , f_boContract_Step : number) {
        return Axios.get(`/DBContr/getContracts_Spec?fkey=${fkey}&f_boContract_Step=${f_boContract_Step}`)
    }

    public static async GetContractsStep(fkey : number , f_boContracts : number) {
        return Axios.get(`/DBContr/getContracts_Step?fkey=${fkey}&f_boContracts=${f_boContracts}`)
    }

    public static async GetContractsSpecSmall(fkey : number , f_boContracts : number) {
        return Axios.get(`/DBContr/getContracts_Spec_small?fkey=${fkey}&f_boContracts=${f_boContracts}`)
    }

    public static async getContractNaklad(ftype : number, f_boContracts : number ) {
        return Axios.get(`/DBContr/getContractNaklad?ftype=${ftype}&f_boContracts=${f_boContracts}`)
    }

    public static async setLinkNaklad(f_boContract_Spec : number, linkKeys : any ) {
        return Axios.get(`/DBContr/setLinkNaklad?f_boContract_Spec=${f_boContract_Spec}&linkKeys=${linkKeys}`)
    }

    public static async getCriteria_Contract(f_boContract_Spec : number) {
        return Axios.get(`/DBContr/getCriteria_Contract?f_boContract_Spec=${f_boContract_Spec}`)
    }

    public static async modifyContractCriteria(f_boContract_Spec : number, inp: string) {
        return Axios.get(`/DBContr/modifyContractCriteria?f_boContract_Spec=${f_boContract_Spec}&inp=${inp}`)
    }

}