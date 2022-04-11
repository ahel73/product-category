<template>
  <div id="app">
    <ol>
      <li
        v-for="item in arrayCategories"
        :key="item.id"
        @click="item=>item"
      >
        <p>{{item.name}}</p>
        <p>подкатегорий: {{item.children.length}}</p>
      </li>
    </ol>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  name: 'Categories',
  data() {
    return ({
      login: 'openbroker',
      passmord: 'yw4Tb8vK',
      transactionID: null,
      incorrectId: true,
      md5: require('md5'),
    })
  },
  computed: {
    getHash() {
      return this.md5(`${this.transactionID}${this.$route.meta.method}${this.login}${this.passmord}`)
    },
    getObjectCatagories() {
      return this.$store.state.categories;
    },
    ...mapGetters([
      'arrayCategories'
    ])
  },
  methods: {
    async receiptCategory(){
      await fetch(`${process.env.VUE_APP_API}/${this.$route.meta.method}`, {
        method: "POST",
        headers: new Headers ( { "Content-Type": "application/xml"} ),
        body: `<Request>
                  <Authentication>
                      <Login>${this.login}</Login>
                      <TransactionID>${this.transactionID}</TransactionID>
                      <MethodName>${this.$route.meta.method}</MethodName>
                      <Hash>${this.getHash}</Hash>
                  </Authentication>
                </Request>`
      })
      .then((response => {
        console.log(response);
        const res = response.text()
        console.log(res)
        return res;
      }))
      .then(text=>{
        console.log(text)
        const xmlParser = new DOMParser()
        const doc =  xmlParser.parseFromString(text, 'text/xml');
        if(doc.querySelector('Status').innerHTML === '1'){
          alert(doc.querySelector('ErrorMessage').innerHTML)
        } else {
          this.incorrectId = false;
          let newCategories = doc.querySelectorAll('Category')
          newCategories = Array.from(newCategories);
          
          const categoriesObj = {};
          newCategories.forEach(el=>{
            let cat;
            if (!el.getAttribute('parentId')) {
              cat = {
                parent: 0,
                id: el.id,
                level: 1,
                name: el.querySelector('name').innerHTML,
                children: []
              }              
            } else {
              let parentId = el.getAttribute('parentId')
              let levelParent = parseFloat(categoriesObj[parentId].level)
              cat = {
                parent: parentId,
                id: el.id,
                level: levelParent ? ++levelParent : null,
                name: el.querySelector('name').innerHTML,
                children: []
              }
              if (categoriesObj[parentId]) {
                categoriesObj[parentId].children.push(el.id)
              } else {
                categoriesObj[parentId].children = [el.id]
              }

            }

            if (categoriesObj[el.id]) {
              categoriesObj[el.id] = { ...cat, ... categoriesObj[el.id] }
            } else {
              categoriesObj[el.id] = cat;
            }
          })
          this.$store.commit('addCategories', categoriesObj )
        }
      })
    }
  },

  async beforeMount() {

    while(!Object.keys(this.getObjectCatagories).length && this.incorrectId){
      const id = prompt('Укажите идентификатор транзакции числом', '')
      if (!isNaN(id)) {
        this.transactionID = id;
      } else {
        continue;
      }
      await this.receiptCategory();
    }
  }
}
</script>
