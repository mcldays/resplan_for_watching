// @ts-ignore
import Axios, { AxiosPromise, AxiosResponse } from '/axios_settings';

export class companiesController {
    public static async GetCompanyType(fkey : string){
        return Axios.get(`/DBContr/getCompanyType?fkey=${fkey}`)
    }
    public static async GetCompanies(fkey : string){
        return Axios.get(`/DBContr/getCompanies?fkey=${fkey}`)
    }
    public static async GetProfession(fkey : string){
        return Axios.get(`/DBContr/getProfession?fkey=${fkey}`)
    }
    public static async GetPodr(fkey : string){
        return Axios.get(`/DBContr/getPodr?fkey=${fkey}`)
    }
}