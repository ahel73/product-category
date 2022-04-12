<template>
  
    
    <ol class="ol-parent">
      <h1 v-if="loadingMessage">
        Данные запрашиваются с сервера
      </h1>
      <li
        v-for="item in arrayCategories"
        :key="item.id"
      >
        <p
          @click='queryProducts(item)'
        >
          {{item.name}} - уровень: {{item.level}}
        </p>
        <p
          @click="openAndCloseChildrenCategories(item)"
        >
          подкатегорий: {{item.children.length}}
        </p>
        <template v-if="openChildrenCategories[item.id]">
          <ol>
            <li
              v-for="item2 in openChildrenCategories[item.id]"
              :key="item2.id"
            >
              <p  @click='queryProducts(item2)'>
                {{item2.name}} - уровень: {{item2.level}}
              </p>
              <p
                @click="openAndCloseChildrenCategories(item2)"
              >
                подкатегорий: {{item2.children.length}}
              </p>
              <template v-if="openChildrenCategories[item2.id]">
                <ol>
                  <li
                    v-for="item3 in openChildrenCategories[item2.id]"
                    :key="item3.id"
                  >
                    <p  @click='queryProducts(item3)'>
                      {{item3.name}}  - уровень: {{item3.level}}
                    </p>
                    <p>
                      подкатегорий: {{item3.children.length}}
                    </p>
                  </li>
                </ol>
              </template>
            </li>
          </ol>
        </template>
      </li>
    </ol>
  
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
      openChildrenCategories: {},
      loadingMessage: false
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
    async queryCategory(){
      this.loadingMessage = true;
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
          this.loadingMessage = false;
          this.$store.commit('addCategories', categoriesObj )
        }
      })
    },

    openAndCloseChildrenCategories(parent) {
      if(!parent.children.length) alert('Нет дочерних категорий')
      if (this.openChildrenCategories[parent.id]) {
        
        delete this.openChildrenCategories[parent.id]
        this.openChildrenCategories = Object.assign({}, this.openChildrenCategories)
      } else {
        this.$set(
          this.openChildrenCategories,
          parent.id, 
          parent.children.map(id=>this.$store.state.categories[id])
        )
      }
      
    },

    queryProducts(category) {
      const arrayId = []
      this.recursionCategories(category, arrayId)
      let transactionID = 0;
      while (!transactionID) {
        transactionID = parseFloat(prompt('укажите идентификатор для запроса товаров'));
      }
      let stringXmlQuery = `
      <?xml version="1.0" encoding="utf-8"?>
      <Request>
        <Authentication>
          <Login>${this.login}</Login>
          <TransactionID>${transactionID}</TransactionID>
          <MethodName>GetProduct</MethodName>
          <Hash>${this.md5(`${transactionID}GetProduct${this.login}${this.passmord}`)}</Hash>
        </Authentication>
        <Parameters>
          <Limit offset="0" row_count="1000"/>
          <Categories>`
      for (let i = 0; i < arrayId.length; ++i) {
        console.log(i, arrayId.length);
        stringXmlQuery += `
            <Category>${arrayId[i]}</Category>`
      }
      stringXmlQuery += `
          </Categories>
          <Params>
          </Params>
        </Parameters>
      </Request>`;
      console.log(stringXmlQuery.trim())
      fetch(`${process.env.VUE_APP_API}/GetProduct`, {
        method: "POST",
        headers: new Headers ( { "Content-Type": "application/xml"} ),
        body: stringXmlQuery.trim(),
      })
      .then(response => response.text())
      .then(text=>{
        const xmlParser = new DOMParser()
        const doc =  xmlParser.parseFromString(text, 'text/xml');
        console.log(doc)
        if(doc.querySelector('Status').innerHTML === '1'){
          alert(doc.querySelector('ErrorMessage').innerHTML)
        } else {
          const products = doc.querySelectorAll('Product');
          const arrayProducts = [];
          products.forEach(prod => {
            const params = prod.querySelectorAll('*');
            let objProd = {};
            params.forEach(param => {
              objProd[param.tagName.toLowerCase()] = param.innerHTML
            })
            arrayProducts.push(objProd)
          });
          this.$store.commit('addProducs', arrayProducts );
          this.$router.push({name: 'Products'})   ;
        }
      });
    },

    recursionCategories(category, arrayId) {
      console.log(category, arrayId)
      arrayId.push(category.id)
      if (category.children.length) {
        for (let i = 0; i < category.children.length; i++) {
          let childCategory = this.$store.state.categories[category.children[i]]
          this.recursionCategories(childCategory, arrayId)
        }
      }
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
      await this.queryCategory();
    }
  }
}
</script>

<style>
  .ol-parent {
    width: 50%;
    background-color: rgb(207, 216, 220);
    padding: 20px;
  }
  .ol-parent > li {
    color: rgb(101, 31, 255);
  }
  li {
    margin-bottom: 20px;
    margin-left: 15px
  }
  li p {
    margin:0;
    cursor: pointer;
  }


</style>
