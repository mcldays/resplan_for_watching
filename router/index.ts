import Vue from 'vue'
import VueRouter, { RouteConfig } from 'vue-router'
import ContractsMain from "@/components/Contracts/ContractsMain.vue";
import OrdersMain from "@/components/Orders/OrdersMain.vue"
import OrdersBalance from "@/components/Orders/OrdersBalance.vue"
import vCotractRestrictResource from "@/components/Contracts/vCotractRestrictResource.vue";
import DictoriesMain from "@/components/Dictories/DictoriesMain.vue";
import TechCardsMain from "@/components/TechCards/TechCardsMain.vue";
import ReportsMain from "@/components/Reports/ReportsMain.vue";
import AdminMain from "@/components/Admin/AdminMain.vue";
import Login from "@/components/Autorization/Login.vue"
import MainMenu from "@/components/GlobalForms/MainMenu.vue";
import NotFound from "@/components/GlobalForms/NotFound.vue"
import diagramList from "@/components/DiagramList/diagramList.vue"
import ExtendedCard from "@/ui/ExtendedCard.vue";
import AccountForm from "@/components/Autorization/AccountForm.vue"
import PermissionsError from "@/components/GlobalForms/PermissionsError.vue"

// динамический импорт, теперь в NetWork будет видно, когда загрузился
//const TechCardsMain = () => import(/* webpackChunkName: "TechCardsMain" */ "@/components/TechCards/TechCardsMain.vue")
Vue.use(VueRouter)

const routes: Array<RouteConfig> = [
  {
    path: '/aut',
    component : Login
  },
  {
    path: '/404',
    alias: '*',
    component: NotFound,
    /*
    path: "/page-not-found",
    alias: '*',
    component: { render: (h) => h("div", ["404! Page Not Found!111"]) },
    */
  },
  {
    path: '/405',
    component: PermissionsError,
    /*
    path: "/page-not-found",
    alias: '*',
    component: { render: (h) => h("div", ["404! Page Not Found!111"]) },
    */
  },

  {
    path: '/',
    component : MainMenu,
    meta: {
      requiresAuth: true
    },
    children: [
      {
        path: 'contracts',
        component: ContractsMain,
        meta: {
          requiresAuth: true
        },

      },
      {
        path: 'contracts/restrict/:Pid?',
        component: vCotractRestrictResource,
        meta: {
          requiresAuth: true
        }
      },
      {
        path: 'orderbook',
        component: OrdersMain,
        meta: {
          requiresAuth: true
        },
        children : [
          {
            path : 'extended',
            component: ExtendedCard,
            name : 'extendedCard',
            props: true
          },
        ]
      },
      {
        path: 'orderbalance',
        component: OrdersBalance,
        meta: {
          requiresAuth: true
        }
      },
      {
        path: 'dictories/:Pid?',
        component: DictoriesMain,
        meta: {
          requiresAuth: true
        }
      },
      {
        path: 'techcard',
        //name: 'techcardhome',
        component: TechCardsMain,
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
      {
        path: '/accountform',
        component: AccountForm,
        meta: {
          requiresAuth: true
        }
      },      
      {
        path:'/diagrams',
        component : diagramList,
        meta : {
          requiresAuth: true
        }
      },
      //:direct/:wtype/:wwork/:stage/:ops
      // будущий роут для страницы с ошибкой

    ]
  }
]



const router = new VueRouter({
  routes
})

export default router
