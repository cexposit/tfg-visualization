<template>
   <v-main>
      <HeaderWeb />
      <WebForms />
    </v-main>
</template>

<script>
import WebForms from './components/WebForms';
import HeaderWeb from './components/Header';
import { mapActions } from 'vuex';


export default {
  name: 'App',

  components: {
    WebForms,
    HeaderWeb,
  },

  methods: {
    ...mapActions(['initialize'])
  },
  
  created: function() {
    this.initialize()
  },
};
</script>
