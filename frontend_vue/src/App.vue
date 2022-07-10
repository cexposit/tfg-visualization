<template>
   <v-main>
      <HeaderWeb />
      <WebForms />
      <ShowData />
    </v-main>
</template>

<script>
import WebForms from './components/WebForms';
import HeaderWeb from './components/Header';
import ShowData from './components/Visualizacion';
import { mapActions } from 'vuex';


export default {
  name: 'App',

  components: {
    WebForms,
    HeaderWeb,
    ShowData
  },

  methods: {
    ...mapActions(['initialize'])
  },
  
  created: function() {
    this.initialize()
  },
};
</script>
