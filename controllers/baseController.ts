// @ts-ignore
import Axios, { AxiosPromise, AxiosResponse } from '/axios_settings';


export class baseController {
    public static async GetDist() {
        return Axios.get(`/DBContr/getDist`)
    }
    public static async getTblNameFromRel(col_name: string) {
        return Axios.get(`/DBContr/getTblNameFromRel?col_name=${col_name}`)
    }
    public static async GetTable(table: string, fkey?: number) {
        return Axios.get(`/DBContr/getTable?table=${table}&fkey=${fkey===undefined?0:fkey}`)
    }
    public static async GetDictTable(table: string) {
        return Axios.get(`/DBContr/getDictTable?table=${table}`)
    }

    public static async getTableFilters(table: string) {
        return Axios.get(`/DBContr/getTableFilters?table=${table}`)
    }

    public static async GetLogs() {
        return Axios.get(`/DBContr/GetLogs`)
    }

    public static async getDictTable_filtered(table: string, fkey: number, parentName: string, parentKey: number) {
        return Axios.get(`/DBContr/getDictTable_filtered?table=${table}&fkey=${fkey}&parentName=${parentName}&parentKey=${parentKey}`)
    }

    public static async getRelValue(columnName : string, fKey? :number ){
        return Axios.get(`/DBContr/getRelValue?columnName=${columnName}&fkey=${fKey}`)
    }
    public static async getRelValue_filtered(columnName : string, fKey: number, Parent_tbl: string, Parent_key: number, isTree: boolean){
        return Axios.get(`/DBContr/getRelValue_filtered?columnName=${columnName}&fkey=${fKey}&Parent_tbl=${Parent_tbl}&Parent_key=${Parent_key}&isTree=${isTree}`)
    }
    public static async applyTableChanges( inpJson : any[]){
        return Axios.post(`/DBContr/applyTableChanges`,inpJson)
    }

    public static async applyOrderSpecPerformers( inpJson : any[]){
        return Axios.post(`/DBContr/applyOrderSpecPerformers`,inpJson)
    }

    public static async applyOrderStepSpend( inpJson : any[]){
        return Axios.post(`/DBContr/applyOrderStepSpend`,inpJson)
    }

    public static async getUserGroup( f_spGroups?: number ) {
        return Axios.get(`/DBContr/getUserGroup?f_spGroups=${f_spGroups}`)
    }

    public static async getUserCompany( f_spUsers?: number ) {
        return Axios.get(`/DBContr/getUserCompany?f_spUsers=${f_spUsers}`)
    }

    public static async getGroupsForUser( f_spUsers?: number ) {
        return Axios.get(`/DBContr/getGroupsForUser?f_spUsers=${f_spUsers}`)
    }

    public static async getReports( f_spReport_type?: number ) {
        return Axios.get(`/DBContr/getReports?f_spReport_type=${f_spReport_type}`)
    }    

    public static async getGroupControlPoint( f_spControlPoints?: number ) {
        return Axios.get(`/DBContr/getGroupControlPoint?f_spControlPoints=${f_spControlPoints}`)
    }

    public static async changePassword( f_spUsers: number, newPassword: string) {
        return Axios.get(`/changePassword?f_spUsers=${f_spUsers}&newPassword=${newPassword}`)
    }

    public static async execReport(f_spReports : number, inp_params : string ) {
        return Axios.get(`/DBContr/execReport?f_spReports=${f_spReports}&inp_params=${inp_params}`)
    }

    public static async getReportParams(f_spReports : number, inp : string) {
        return Axios.get(`/DBContr/getReportParams?f_spReports=${f_spReports}&inp=${inp}`)
    }

    public static async getOrderSpecPerformers(f_boOrder_Spec: number) {
        return Axios.get(`/DBContr/getOrderSpecPerformers?f_boOrder_Spec=${f_boOrder_Spec}`)
    }

    public static async saveParamsValue( inpJson : any[]) {
        return Axios.post(`/DBContr/saveParamsValue`,inpJson)
    }

    // API-запрос для получения дерева классификатора работ
    public static async getTreeRoot(tblName?: string, keys?: string){
        return Axios.get(`/DBContr/getTreeRoot/?tblName=${tblName}&keys=${keys}`)
    }
    public static async getReportGraf(f_boOrder : number, f_spCompany: number){
        return Axios.get(`/DBContr/reportGraf/?f_boOrder=${f_boOrder}&f_spCompany=${f_spCompany}`)
    }


    public static async execReportToFile(f_spReports : number, inp_params : string ) {
        return Axios.get(`/DBContr/execReportToFile?f_spReports=${f_spReports}&inp_params=${inp_params}`)
        .then((response:any) => {
            //console.log("response",response)
            const temp = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = temp;
            link.setAttribute('download', 'report' + f_spReports.toString() + '.csv'); //or any other extension
            document.body.appendChild(link);
            link.click();
        });
    }

    public static async execReportToFileXLSX(f_spReports : number, inp_params : string ) {
        return Axios.request({
            method: 'GET',
            url: `/DBContr/execReportToFileXLSX?f_spReports=${f_spReports}&inp_params=${inp_params}`,
            responseType: 'arraybuffer',
            reponseEncoding: 'binary',
        }
        )
        .then((response:any) => {
            //console.log("response",response)
            const temp = window.URL.createObjectURL(new Blob([response.data],{type:response.headers['content-type']}));
            const link = document.createElement('a');
            link.href = temp;
            link.setAttribute('download', 'report' + f_spReports.toString() + '.xlsx'); //or any other extension
            document.body.appendChild(link);
            link.click();
        });
    }

    public static async execReportToFileDOCX(f_boOrders : number, f_spReports : number ) {
        return Axios.request({
            method: 'GET',
            url: `/DBContr/execReportToFileDOCX?f_boOrders=${f_boOrders}&f_spReports=${f_spReports}`,
            responseType: 'arraybuffer',
            reponseEncoding: 'binary',
        }
        )
        .then((response:any) => {
            //console.log("response",response)
            const temp = window.URL.createObjectURL(new Blob([response.data],{type:response.headers['content-type']}));
            const link = document.createElement('a');
            link.href = temp;
            link.setAttribute('download', 'report' + f_spReports.toString() + '.docx'); //or any other extension
            document.body.appendChild(link);
            link.click();
        });
    }

    public static async getSpendMatType(f_boContracts?: number, f_boOrders?: number) {
        return Axios.get(`/DBContr/geSpendtMatType?f_boContracts=${f_boContracts}&f_boOrders=${f_boOrders}`)
    }

    public static async getSearchRoot(tblName?: string, inp?: string){
        return Axios.get(`/DBContr/getSearchRoot/?tblName=${tblName}&inp=${inp}`)
    }

    public static async getSearchResult(tblName?: string, inp?: string){
        return Axios.get(`/DBContr/getSearchResult/?tblName=${tblName}&inp=${inp}`)
    }

    public static async getFileFromTable( fkey?: number){
        return Axios.request({
            method: 'GET',
            url: `/DBContr/getFileFromTable/?fkey=${fkey}`,
            responseType: 'arraybuffer',
            reponseEncoding: 'binary',
        }
        )
        .then((response:any) => {
            const disposition = response.headers['content-disposition']
            let fileName = "";
            if (disposition && disposition.indexOf('attachment') !== -1) {
                const filenameRegex = /filename\*=UTF-8''([\w%\-.+]+)(?:; ?|$)/i;
                const matches = filenameRegex.exec(disposition);
                if (matches != null && matches[1]) { 
                  fileName = decodeURIComponent(matches[1].replace(/['"]/g, ''));
                }
            }
            const temp = window.URL.createObjectURL(new Blob([response.data],{type:response.headers['content-type']}));
            const link = document.createElement('a');
            link.href = temp;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
        });
    }

    public static async setFileFromTable(fkey: number, fileData : FormData){
        return Axios.post(`/DBContr/setFileFromTable?fkey=${fkey}`,fileData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
        })
    }

    public static async getOrderStepSpend(f_boOrder_Step?: number) {
        return Axios.get(`/DBContr/getOrderStepSpend?f_boOrder_Step=${f_boOrder_Step}`)
    }

    public static async getSpendMat(f_boOrder_Step?: number) {
        return Axios.get(`/DBContr/getSpendMat?f_boOrder_Step=${f_boOrder_Step}`)
    }

    public static async getSpendMatNom(f_boOrder_Step?: number) {
        return Axios.get(`/DBContr/getSpendMatNom?f_boOrder_Step=${f_boOrder_Step}`)
    }

    public static async getSpendMatType_new(f_boOrder_Step?: number) {
        return Axios.get(`/DBContr/getSpendMatType?f_boOrder_Step=${f_boOrder_Step}`)
    }

    public static async getSpendTravel(f_boOrder_Step?: number) {
        return Axios.get(`/DBContr/getSpendTravel?f_boOrder_Step=${f_boOrder_Step}`)
    }

    public static async getSpendSubWorks(f_boOrder_Step?: number) {
        return Axios.get(`/DBContr/getSpendSubWorks?f_boOrder_Step=${f_boOrder_Step}`)
    }

    public static async getSpendLab(f_boOrder_Step?: number) {
        return Axios.get(`/DBContr/getSpendLab?f_boOrder_Step=${f_boOrder_Step}`)
    }

    public static async getSpends(f_boOrder_Step?: number) {
        return Axios.get(`/DBContr/getSpends?f_boOrder_Step=${f_boOrder_Step}`)
    }

}