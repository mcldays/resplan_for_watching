// @ts-ignore
import Axios, { AxiosPromise, AxiosResponse } from '/axios_settings';
import {accountModel} from "@/models/accountModel";
export class autController{

    public static async Authorization(login: string, password : string ){
        return Axios.post(`/token?login=${login}&password=${password}`)
    }
    public static async Registration(account : accountModel){
        return Axios.get(`/newUserRegistration?fName=${account.fName}&fLogin=${account.fLogin}
        &Password=${account.Password}&fEmail=${account.fEmail}&fDescription=${account.fDescription}`)
    }

    //Сменить пароль пользователя
    public static async ChangePassword(f_spUsers : number, newPass : string){
        return Axios.get(`/changePassword?f_spUsers=${f_spUsers}&newPassword=${newPass}`)
    }

    //Получение контрольных точек авторизованного пользователя
    public static async getUserControlPoints() {
        return Axios.get(`/getUserControlPoints`)
    }

    public static async getUserControlPointsTree() {
        return Axios.get(`/getUserControlPoints_JSON_Tree`)
    }

    //Получение информации об авторизованном пользователе
    public static async getUserInfo(){
        return Axios.get(`/getUserInfo`)
    }
    
     //Получить подразделения доступные пользователю
     public static async getUserCompany(){
        return Axios.get(`/getUserCompany`)
    }

    //Получить аватарку из таблицы файлов
    public static async getAvatarFromTable( fkey?: number){
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
            return link;
        });
    }

    // загрузить аватар пользователя
    public static async setUserAvatar( fkey: number, fileData : FormData)
    {
        return Axios.post(`/setUserAvatar?f_spUsers=${fkey}`,fileData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
        })
    }
}