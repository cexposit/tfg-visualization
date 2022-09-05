<template>
  <!-- <v-app> -->
  <v-app-bar app color="green" dark>
    <div class="d-flex align-center">
      <v-img alt="Vuetify Name" class="shrink mt-1 hidden-sm-and-down" contain min-width="100"
        src="https://cdn.vuetifyjs.com/images/logos/vuetify-name-dark.png" width="100" />
    </div>

    <v-container>
      <v-row>
        <v-col cols="3" md="3">
          <v-form ref="form">
            <v-text-field v-model="json_name" label="Nombre"></v-text-field>
          </v-form>
        </v-col>
        <v-col cols="3" md="3">
          <p>
            <v-file-input width="50px" v-on:change="ReadFichero(json_msg)" type="file" id="File"></v-file-input>
          </p>
        </v-col>
        <v-col>
          <v-btn text @click="submit">Subir</v-btn>
        </v-col>
      </v-row>
    </v-container>

  </v-app-bar>


</template>

<script>
import { mapGetters } from 'vuex';

export default {
  name: 'HeaderWeb',

  data(){
    return {
      json_name: '',
      json_msg: ''
    }
  },

  methods: {
    ...mapGetters([
      'get_ws'
    ]),

    ReadFichero() {
      var fileUploaded = document.getElementById("File").files[0];
      var fileReader = new FileReader();
      var _this = this

      fileReader.onload = function (fileLoadEvent) {
        var fileContent = fileLoadEvent.target.result;
         _this.json_msg = fileContent
      }
      fileReader.readAsText(fileUploaded, "UTF-8")
    },

    submit(){
      let message = {
        "name": this.json_name,
        "json": this.json_msg
      }
      let connection = this.get_ws()
      connection.send(JSON.stringify(message))
    }
  },
}
</script>

<style>
.header {
  background-color: yellowgreen;
}
</style>