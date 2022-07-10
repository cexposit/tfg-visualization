<template>
  <div id="app">
    <v-app id="inspire">
      <v-container>
        <v-row >

          <v-col cols="6" md="3">
            <v-form ref="form">
              <!-- OBLIGAR A QUE EL USUARIO INTRODUZCA UNA FECHA -->
              <v-text-field v-model="first_date" label="Fecha inicial"></v-text-field>
              2022-12-05 00:00:01.001
            </v-form>
            <v-checkbox v-model="include_fd" label="INCLUIR FECHA INICIAL"></v-checkbox>
          </v-col>

          <v-col cols="6" md="3">
            <v-form ref="form">
              <!-- OBLIGAR A QUE EL USUARIO INTRODUZCA UNA FECHA -->
              <v-text-field v-model="last_date" label="Fecha final"></v-text-field>
              2030-12-05 00:00:01.001
            </v-form>
            <v-checkbox v-model="include_ld" label="INCLUIR FECHA FINAL"></v-checkbox>
          </v-col>

          <v-col cols="12" md="6">
            <v-form ref="form">
              <v-autocomplete 
                v-model="current_table"
                :items="table_names"
                label="Esquemas"
              />
            </v-form>
          </v-col>

        </v-row>
        {{btn_disabled()}}
        <!-- <v-btn :disabled='isDisabled' text @click="submit">Enviar</v-btn> -->
        <v-btn text @click="submit">Enviar</v-btn>
      </v-container>

    </v-app>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { mapActions } from 'vuex';

export default {
  name: 'WebForms',

  data () {
    return {
      first_date: '',
      last_date: '',
      include_fd: false,
      include_ld: false,
      table_names: this.get_name_tables(), 
      // isDisabled: this.btn_disabled(),  
      current_table: null
    }
  },
  
  methods: {
    submit() {
      let obj = {
        "table": this.current_table,
        "min": this.first_date,
        "include_min": this.include_fd,
        "max": this.last_date,
        "include_max": this.include_ld
      }
      obj = JSON.stringify(obj)
      this.send_to_back(obj)
    },

  btn_disabled(){
    this.isDisabled = this.get_btn()
  },

    ...mapGetters([
      'get_ws',
      'get_name_tables',
      'get_btn'
    ]), 
    ...mapActions([
      'send_to_back'
    ]), 
  },
}
</script>
