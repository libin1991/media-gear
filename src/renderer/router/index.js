import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: '首页',
      component: require('@/pages/home').default
    },
    {
      path: '*',
      name: '404 Not Found',
      component: require('@/pages/errorPages/404').default
    }
  ]
})
