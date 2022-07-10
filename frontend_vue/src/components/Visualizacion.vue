<template>
    <div>

<ul>
    <li v-for="(item, index) in get_data" :key="index">
        {{ item }}
    </li>
</ul>

    </div>

</template>

<script>
import { mapGetters } from 'vuex'

export default {
    name:'ShowData',

    computed: {
        ...mapGetters([
            'get_data'
        ]), 
    },
}
</script>

<style>
</style>