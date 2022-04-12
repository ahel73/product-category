import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    categories: {},
    products: [],
    product: null
  },
  getters: {
    arrayCategories(state) {
      const shellArray = [];
      for (const id in state.categories) {
        if (state.categories[id].level === 1) {
          shellArray.push(state.categories[id])
        }
      }
      return shellArray;
    }
  },
  mutations: {
    addCategories(state, newCategories ) {
      state.categories = newCategories
    },
    addProducs(state, newProducs ) {
      state.products = newProducs
    },
    addProduct(state, newProduct ) {
      state.product = newProduct
    }
  },
  actions: {
    
  },
  modules: {
  }
})
