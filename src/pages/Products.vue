<template>
  <div class='products'>
    <ol v-if="getProducts">
      <li 
        v-for="product in getProducts" 
        :key="product.id"
        @click="queryProduct(product)"
      >
        <img style="width: 20%" :src="product.foto" :alt="product.name">
        <h6>{{product.name}} - {{product.price}}руб</h6>
      </li>
    </ol>
      
  </div>
</template>

<script>
export default {
  name: 'Products',
  data() {
      return({
        login: 'openbroker',
        passmord: 'yw4Tb8vK',
        md5: require('md5'),
      })
  },
  computed: {
      getProducts() {
          return this.$store.state.products;
      },
  },
  methods: {
    queryProduct(product) {
      console.log(product)
      let transactionID = parseFloat(prompt('укажите номер идентификатора для запроса товара'));
      if (!transactionID) {
        alert('идентификатор должен быть числом');
        return;
      }

      fetch(`${process.env.VUE_APP_API}/${this.$route.meta.methodProduct}`, {
        method: "POST",
        headers: new Headers ( { "Content-Type": "application/xml"} ),
        body: `<Request>
                <Authentication>
                    <Login>${this.login}</Login>
                    <TransactionID>${transactionID}</TransactionID>
                    <MethodName>${this.$route.meta.methodProduct}</MethodName>
                    <Hash>${this.md5(`${transactionID}${this.$route.meta.methodProduct}${this.login}${this.passmord}`)}</Hash>
                </Authentication>
                <Parameters>
                    <Products>
                        <Product>${product.id}</Product>
                    </Products>
                </Parameters>
              </Request>`
      })
      .then(response => response.text())
      .then(text=> {
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
          this.$store.commit('addProduct', arrayProducts[0] );
          this.$router.push({
            name: 'Product',
            params: {id: product.id}
          });
        }
      })
    }
  },    
}
</script>