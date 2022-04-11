import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Categories',
    meta: {
      method: 'GetCategories',
    },    
    component: () => import('./pages/Categories'),
  },
]
const router = new VueRouter({
  mode: 'history',
  routes
})

export default router