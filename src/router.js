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
  {
    path: '/poducts-list',
    name: 'Products',
    meta: {
      methodProduct: 'GetProduct',
    },
    component: () => import('./pages/Products'),
  },
  {
    path: '/poduct/:id',
    name: 'Product',
    component: () => import('./pages/Product'),
  },
]
const router = new VueRouter({
  mode: 'history',
  routes
})

export default router