import Vue from 'vue'
import Vuex from 'vuex'
Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    ws_connection: new WebSocket("ws://localhost:8181/"),
    tables_db: [],
    data: [],
    // btn_disabled: false
  },
  mutations: {
    update_tables(state, payload) {
      state.tables_db.push(payload)
    },

    send_data(state, payload) {
      // state.btn_disabled = true
      state.ws_connection.send(payload)
    },

    save_data(state, payload){
      console.log("el payload bobo: ", payload)
      // let keys = Object.keys(state.data)
      state.data.push(payload)
    },

    enable_btn(state){
      state.btn_disabled = false
    }
  },

  getters: {
    get_ws: function (state) {
      return state.ws_connection
    },
    get_name_tables: function (state) {
      return state.tables_db
    },
    get_btn: function (state) {
      return state.btn_disabled
    },
    get_data: function (state) {
      return state.data
    }
  },

  actions: {
    initialize({ commit, getters }) {
      let connection = getters.get_ws

      connection.onopen = function (event) {
        console.log(event)
        console.log("Succesfully connected")
      }

      
      connection.onmessage = function (event) {
        // const data = new FormData()
        var objeto = JSON.parse(event.data)
        console.log("Starting connection")
        console.log(objeto)
        

        // isArray
        if (objeto.length != undefined){
          if (objeto[0].type == "name_tables" ) {
            for (let index = 0; index < objeto.length; index++) {
              commit('update_tables', objeto[index].table_name)
              // getters.get_name_tables("get_tables", objeto[index].table_name);
              // db_tables.push();
            }
          }
        }
        else{
          if (objeto.type == "query") {
            console.log("las querys")
            commit('save_data', objeto)
          }
  
          if (objeto.type == "filters") {
            console.log("los filtros")
            // commit('enable_btn')
            // commit(save_data)
          }
        }

        // vm.$store.commit("get_tables", db_tables);
        // console.log(db_tables)
      }
    },
    send_to_back({commit}, data) {
      commit('send_data', data)
    }
    },




  })


  // var Intervalo = setInterval(function(){
  //   const newRow = row[currentIndex]
  //   newRow["type"]="query"

  //   const data = (JSON.stringify(newRow));
  //   console.log("aqui está la data: ", data)
  //   client.ws.send(data, index);
  //   currentIndex++;
  //   if (currentIndex == row.length) clearInterval(Intervalo)


  // })