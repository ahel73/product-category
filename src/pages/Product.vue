<template>
<div>
<h1>{{getProduct.name}}</h1>
<img style="max-height: 400px" :src="getProduct.foto" alt="">
</div>
</template>

<script>
export default {
    nmae: "Product",
    data() {
        return ({
            // 
        })
    },
    computed: {
        getProduct() {
            return this.$store.state.product;
        },
    },
}
</script>