<template>
  <!-- <v-app> -->
  <v-app-bar app color="green" dark>
    <div class="d-flex align-center">
      <v-img alt="Vuetify Name" class="shrink mt-1 hidden-sm-and-down" contain min-width="100"
        src="https://cdn.vuetifyjs.com/images/logos/vuetify-name-dark.png" width="100" />
    </div>

    <v-spacer></v-spacer>
    <p>
      <input v-on:change="ReadFichero()" type="file" id="File">
    </p>
    <!-- <v-btn v-on:change="ReadFichero">Subir Fichero</v-btn>  -->
  </v-app-bar>


  <!-- </v-app> -->
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  name: 'HeaderWeb',

  methods: {
    ...mapGetters([
      'get_ws'
    ]),

    ReadFichero: function () {
      let connection = this.get_ws()
      var fileUploaded = document.getElementById("File").files[0];
      var fileReader = new FileReader();

      fileReader.onload = function (fileLoadEvent) {
        var fileContent = fileLoadEvent.target.result;
        connection.send(fileContent);
      }

      fileReader.readAsText(fileUploaded, "UTF-8")
    }
  },
}
</script>

<style>
.header {
  background-color: yellowgreen;
}
</style>