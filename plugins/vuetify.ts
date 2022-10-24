import Vue from 'vue';
import Vuetify from 'vuetify/lib/framework';
import '@mdi/font/css/materialdesignicons.css'
import ru from 'vuetify/src/locale/ru'


Vue.use(Vuetify);

export default new Vuetify({
    icons: {
        iconfont: 'mdi'
    },
    lang: {
        locales: { ru },
        current: 'ru',
    },
});
