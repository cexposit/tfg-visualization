import Vue from 'vue'
import Vuex from 'vuex'
Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    ws_connection: new WebSocket("ws://localhost:8181/"),
    posdata_from_server: 0,
    schemes_db: [],
    data: [],
    
  },
  mutations: {
    update_schemes(state, payload) {
      state.schemes_db.push(payload)
    },
    update_posdata_from_server(state, payload) {
      state.posdata_from_server += payload
    },
    send_data(state, payload) {
      state.ws_connection.send(payload)
    },
    save_data(state, payload) {
      let data = state.data
      payload.forEach(d => data.push(d))
      state.data = data
    },
    enable_btn(state) {
      state.btn_disabled = false
    }
  },

  getters: {
    get_ws: function (state) {
      return state.ws_connection
    },
    get_name_schemes: function (state) {
      return state.schemes_db
    },
    get_btn: function (state) {
      return state.btn_disabled
    },
    get_data: function (state) {
      return state.data
    },
    get_posdata_from_server: function (state) {
      return state.posdata_from_server
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
        var objeto = JSON.parse(event.data)

        if (objeto[0] && objeto[0].type == "name_schemes") {
          for (let index = 0; index < objeto.length; index++) {
            commit('update_schemes', objeto[index].schemename_user)
          }
        }
        else {
          commit('save_data', objeto)
          commit('update_posdata_from_server', objeto.length)
        }
      }
    },

    send_to_back({ commit }, data) {
      commit('send_data', data)
    }
  },
})

