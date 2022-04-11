import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    categories: {},
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
    }
  },
  actions: {
  },
  modules: {
  }
})
