import Vue from 'vue'
import VueRouter, { RouteConfig } from 'vue-router'
import ContractsMain from "@/components/Contracts/ContractsMain.vue";
import OrdersMain from "@/components/Orders/OrdersMain.vue"
import vCotractRestrictResource from "@/components/Contracts/vCotractRestrictResource.vue";
import DictoriesMain from "@/components/Dictories/DictoriesMain.vue";
import TechCardsMain from "@/components/TechCards/TechCardsMain.vue";
import ReportsMain from "@/components/Reports/ReportsMain.vue";
import AdminMain from "@/components/Admin/AdminMain.vue";
import Login from "@/components/Autorization/Login.vue"
import MainMenu from "@/components/GlobalForms/MainMenu.vue";

// динамический импорт, теперь в NetWork будет видно, когда загрузился
//const TechCardsMain = () => import(/* webpackChunkName: "TechCardsMain" */ "@/components/TechCards/TechCardsMain.vue")
Vue.use(VueRouter)

const routes: Array<RouteConfig> = [
  {
    path: '/',
    components : {
      aut : Login
    },
    name : "aut"
  },
  {
    path : '/main',
    components : {
      main : MainMenu
    },
    name: "main",
    meta: {
      requiresAuth: true
    },
    children : [
      {
        path : 'contracts',
        component : ContractsMain,
        meta: {
          requiresAuth: true
        },

      },
      {
        path : 'contracts/restrict/:Pid?',
        component : vCotractRestrictResource,
        meta: {
          requiresAuth: true
        }
      },
      {
        path: 'orderbook',
        component: OrdersMain,
        meta: {
          requiresAuth: true
        }
      },
      {
        path:'dictories/:Pid?',
        component : DictoriesMain,
        meta: {
          requiresAuth: true
        }
      },
      {
        path:'techcard',
        //name: 'techcardhome',
        component : TechCardsMain,
        meta: {
          requiresAuth: true
        }
        /*children: [{
            path: ':id',
            name: 'techcarditem',
            component: TechCardsMain,
        }]*/
      },
      {
        path: 'reports',
        component: ReportsMain,
        meta: {
          requiresAuth: true
        }
      },
      {
        path: 'admin',
        component: AdminMain,
        meta: {
          requiresAuth: true
        }
      },
      //:direct/:wtype/:wwork/:stage/:ops
      // будущий роут для страницы с ошибкой
      {
        path : 'page-not-found',
        alias: '*',
        component : ContractsMain,
        meta: {
          requiresAuth: true
        }
        /*
        path: "/page-not-found",
        alias: '*',
        component: { render: (h) => h("div", ["404! Page Not Found!111"]) },
        */
      },
    ]
  },


]



const router = new VueRouter({
  routes
})

export default router
