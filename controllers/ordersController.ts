// @ts-ignore
import Axios, { AxiosPromise, AxiosResponse } from '/axios_settings';

export class ordersController {
    public static async GetAll(){
        return Axios.get("/DBContr/getOrders")
    }

    public static async getOrders_filtered(f_spCompany: number, filters: string){
        return Axios.get(`/DBContr/getOrders_filtered?f_spCompany=${f_spCompany}&filters=${filters}`)
    }

    public static async GetOrdersSpec(fkey : number , f_boOrder_Step : number ) {
        return Axios.get(`/DBContr/getOrders_Spec?fkey=${fkey}&f_boOrder_Step=${f_boOrder_Step}`)
    }

    public static async GetOrdersStep(fkey : number , f_boOrders : number ) {
        return Axios.get(`/DBContr/getOrders_Step?fkey=${fkey}&f_boOrders=${f_boOrders}`)
    }

    public static async getWorksRoot(inp : string) {
        return Axios.get(`/DBContr/getWorksRoot?inp=${inp}`)
    }

    public static async newOrderFromContract(f_boOrders : string) {
        return Axios.get(`/DBContr/newOrderFromContract?f_boOrders=${f_boOrders}`)
    }

    public static async newOreedrFromOrder(f_boOrders_template : string) {
        return Axios.get(`/DBContr/newOreedrFromOrder?f_boOrders_template=${f_boOrders_template}`)
    }

    public static async modifySpecFromTree(f_boOrderSteps : number, inp: string) {
        return Axios.get(`/DBContr/modifySpecFromTree?f_boOrderSteps=${f_boOrderSteps}&inp=${inp}`)
    }

    public static async calcOrderGrafic(f_boOrder : string) {
        return Axios.get(`/DBContr/calcOrderGrafic?f_boOrder=${f_boOrder}`)
    }

    public static async getOperFormuls(f_boOrders : number) {
        return Axios.get(`/DBContr/getOperFormuls?f_boOrders=${f_boOrders}`)
    }    

    public static async getCriteria_Order(f_boOrders : number) {
        return Axios.get(`/DBContr/getCriteria_Order?f_boOrders=${f_boOrders}`)
    }

    public static async modifyOrderCriteria(f_boOrders : number, inp: string) {
        if (inp.length === 0) { inp = "0" }
        return Axios.get(`/DBContr/modifyOrderCriteria?f_boOrders=${f_boOrders}&inp=${inp}`)
    }

    public static async modifyPatentOpers( inpJson : any[]) {
        return Axios.post(`/DBContr/modifyPatentOpers`,inpJson)
    }

    public static async getAnalogOpers(boOrder_Spec: number, criteriaList: string) {
        return Axios.get(`/DBContr/getAnalogOpers?boOrder_Spec=${boOrder_Spec}&criteriaList=${criteriaList}`)
    }

    public static async updateCriteria_Order_Spec(boOrder_Spec: number, criteriaList: string) {
        return Axios.get(`/DBContr/updateCriteria_Order_Spec?boOrder_Spec=${boOrder_Spec}&criteriaList=${criteriaList}`)
    }

    public static async saveOrderOperTrud(boOrder_Spec: number, fTrud: string) {
        return Axios.get(`/DBContr/saveOrderOperTrud?boOrder_Spec=${boOrder_Spec}&fTrud=${fTrud}`)
    }

    public static async execReportResPlanToXLSX(f_boOrders : number, f_spCompany : number) {
        return Axios.request({
            method: 'GET',
            url: `/DBContr/execReportResPlanToXLSX?f_boOrders=${f_boOrders}&f_spCompany=${f_spCompany}`,
            responseType: 'arraybuffer',
            reponseEncoding: 'binary',
        }
        )
        .then((response:any) => {
            //console.log("response",response)
            const temp = window.URL.createObjectURL(new Blob([response.data],{type:response.headers['content-type']}));
            const link = document.createElement('a');
            link.href = temp;
            link.setAttribute('download', 'report' + f_boOrders.toString() + '.xlsx'); //or any other extension
            document.body.appendChild(link);
            link.click();
        });
    }
}