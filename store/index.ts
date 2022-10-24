import Vue from 'vue'
import Vuex from 'vuex'
import { GetterTree, MutationTree, ActionTree } from "vuex"
import Axios from '@/../axios_settings';
import {autController} from "@/controllers/autController";


Vue.use(Vuex)

class State {
  dots = {}
    upLevelDots = {}
  status  = ''
  token: string =  localStorage.getItem('token') || ''
  userID : string =  localStorage.getItem('userID') || ''
  userName : string =  localStorage.getItem('userName') || ''
}

const getters = <GetterTree<State, any>>{
  isLoggedIn: state => !!state.token,
  getToken : state => state.token,
  getUserName: state => state.userName,
  getUserID: state => state.userID,
    getControlDots : state => state.dots,
    getUpLevelDots : state => state.upLevelDots
};

const mutations = <MutationTree<State>><unknown>{
  auth_success(state : State, token: any) {
    state.status = 'success'
    state.token = token.token
    state.userID = token.autUserID
    state.userName = token.userName
 },
  auth_error(state : any){
    state.status = 'error'
  },
    mutateDots(state : State, dots : any[] ){
        state.dots = dots
        //console.log(dots)
        const directories = dots.filter(e=>e.fName === "Справочники" )

        const childs = directories[0].child

        const availableDots = []
        for (let i = 0; i < dots.length; i++) {
            availableDots.push({
                id: i,
                name: dots[i].fName,
                href : dots[i].href,

            })
        }
        for (let i = 0; i < childs.length; i++) {
            availableDots.push({
                id:i,
                name : childs[i].fName,
                href : "/dictories/" + childs[i].href
            })
        }
        availableDots.push({
            name : "Справочники",
            href : "/dictories/:Pid"
        },
        {
            name : "Аккаунт",
            href : "/accountform"
        },
        {
            name : "Расширенная Карточка",
            href : "/orderbook/extended"
        },
        {
                name : "Домашняя страница",
                href : "/"
        }
        )

        state.upLevelDots = availableDots

    },
  logout(state : any) {
    state.status = ''
    state.token = ''
    state.userID = ''
    state.userName = ''
    state.dots= {}
  },
};

const actions = <ActionTree<State, any>>{
  login(store, user){
    return new Promise((resolve, reject) => {
      autController.Authorization(user.login, user.password)
          .then(resp => {
            const token = resp.data.access_token
            const userID = resp.data.userID
            const userName = resp.data.username
            //window.localStorage.setItem('role', resp.data.role)
            //window.localStorage.setItem('availableChapters', JSON.stringify(resp.data.availableChapters))
            window.localStorage.setItem('token', token)
            window.localStorage.setItem('userName', userName)
            window.localStorage.setItem('userID', userID)
            Axios.defaults.headers.common['Authorization'] = "Bearer " +  token
            //console.log("resp",resp)
            this.commit('auth_success', { token:token, userID: userID, userName:userName })
            resolve(resp)
          })
          .catch(err => {
            this.commit('auth_error')
            window.localStorage.removeItem('token')
            reject(err)
          })
    })
  },
  logout(){
    return new Promise((resolve, reject) => {
      this.commit('logout')
      window.localStorage.removeItem('token')
      delete Axios.defaults.headers.common['Authorization']
      // @ts-ignore
      resolve()
    })
  },
    //Здесь нужно написать метод который получает контрольные точки
    reRenderDots(){
      return new Promise((resolve, reject)=>{
         autController.getUserControlPointsTree().then(resp=> {
             const dots = resp.data
             this.commit('mutateDots', dots)
             resolve(resp)
         })
             .catch(err=>{
                 this.commit('')
                 reject(err)
             })
      })
    }

};

export default new Vuex.Store({
  state: new State(),
  mutations: mutations,
  actions: actions,
  getters : getters
})
