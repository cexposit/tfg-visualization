<template>
  <HeaderWeb />
  <p>
    <input type="file" id="File">
  </p>
  <button v-on:click="ReadFichero">Subir Archivo</button>
</template>

<script>
//import { file } from '@babel/types';
import HeaderWeb from './components/HeaderWeb.vue'
const connection = new WebSocket("ws://localhost:8181/")

export default {
  name: 'App',
  components: {
    HeaderWeb
  },
  data: function() {
    return {
      connection: null
    }
  },
  methods: {
    ReadFichero: function() {
      var fileUploaded = document.getElementById("File").files[0];
      var fileReader = new FileReader();

      fileReader.onload = function(fileLoadEvent){
          var fileContent = fileLoadEvent.target.result;
            console.log(fileContent)
            console.log(connection)
            connection.send(fileContent);
      }

      fileReader.readAsText(fileUploaded, "UTF-8")
    }
  },
  created: function() {
    console.log("Starting connection")


    connection.onopen = function(event) {
      console.log(event)
      console.log("Succesfully connected")
    }

    connection.onmessage = function(event) {
      console.log(event)
    }
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
