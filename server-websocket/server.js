let _ = require('underscore')
let WebSocketServer = require('ws').Server
const WebSocket = require('ws')
let wss = new WebSocketServer({ port: 8181 })
let uuid = require('uuid')
const { Pool } = require('pg')

let clients
const connectionString = 'postgresql://postgres:password@dbtimescale:5432/db_view_data'
const pool = new Pool({
  connectionString,
})

function initialize() {
  clients = []
  createLogTable()

}

function createLogTable() {
  pool.query('CREATE TABLE IF NOT EXISTS logschemes (id BIGSERIAL, schemename_user varchar(500) UNIQUE NOT NULL, tablename_server varchar(500) NOT NULL UNIQUE)')
}

  async function sendDataWithPostgresSQL(client, current_table, minimo, includemin, maximo, includemax, pos) {

      let query;
      if (includemin == true) {
        if (includemax == true) {
          query = `SELECT * FROM ${current_table.rows[0].tablename_server} WHERE time >= to_timestamp('` + minimo + "', 'YYYY-MM-DD hh24:mi:ss')::timestamp without time zone AND time <= to_timestamp('" + maximo + "', 'YYYY-MM-DD hh24:mi:ss')::timestamp without time zone limit 5 offset " + pos + ";";
        }
        else {
          query = `SELECT * FROM ${current_table.rows[0].tablename_server} WHERE time >= to_timestamp('` + minimo + "', 'YYYY-MM-DD hh24:mi:ss')::timestamp without time zone AND time < to_timestamp('" + maximo + "', 'YYYY-MM-DD hh24:mi:ss')::timestamp without time zone limit 5 offset " + pos + ";";
        }
      } else {
        if (includemax == true) {
          query = `SELECT * FROM ${current_table.rows[0].tablename_server} WHERE time > to_timestamp('` + minimo + "', 'YYYY-MM-DD hh24:mi:ss')::timestamp without time zone AND time <= to_timestamp('" + maximo + "', 'YYYY-MM-DD hh24:mi:ss')::timestamp without time zone limit 5 offset " + pos + ";";
        }
        else {
          query = `SELECT * FROM ${current_table.rows[0].tablename_server} WHERE time > to_timestamp('` + minimo + "', 'YYYY-MM-DD hh24:mi:ss')::timestamp without time zone AND time < to_timestamp('" + maximo + "', 'YYYY-MM-DD hh24:mi:ss')::timestamp without time zone limit 5 offset " + pos + ";";
        }
      }
      console.log("La query: ", query)
      pool.query(query).then(result => {
        const rows = result.rows;
        if (rows.length > 0){
          console.log("Row: ", rows)
          client.ws.send(JSON.stringify(rows));
        }else
          console.log("WAITING")

      }).catch(err => {
        console.log("error: ", err);
      })
}

async function create_table(table_name, ws) {

  await pool.query('CREATE TABLE IF NOT EXISTS ' + table_name + '(pruebaid BIGSERIAL, time TIMESTAMPTZ NOT NULL, status text[] NOT NULL)')

  const res = await pool.query("SELECT create_hypertable('" + table_name + "','time')")
}

async function insertDataIntoDB(json_msg, ws) {

  let scheme_from_msg = json_msg.name
  scheme_from_msg = scheme_from_msg.toLowerCase().trim()

  const res = await pool.query("SELECT schemename_user FROM logschemes")
  if (res) {
    let all_schemes = JSON.stringify(res.rows)

    if (!all_schemes.includes(scheme_from_msg)) {
      const res = await pool.query("SELECT COUNT (*) FROM logschemes")
      const text = 'INSERT INTO logschemes (schemename_user, tablename_server) VALUES($1, $2)'
      const table_server = "table_server_" + res.rows[0].count
      const values = [scheme_from_msg, table_server]

      await pool.query(text, values)
      await create_table(table_server, ws)
      await sendSchemeName(ws)
    }

    const current_table = await pool.query("SELECT tablename_server FROM logschemes WHERE schemename_user = '" + scheme_from_msg + "'")
    const text = 'INSERT INTO ' + current_table.rows[0].tablename_server + '(time, status) VALUES($1, $2)'
    const values_to_query = JSON.parse(json_msg.json)

    for (let index = 0; index < values_to_query.data.length; index++) {
      const values = [values_to_query.data[index].time, values_to_query.data[index].status]
      await pool.query(text, values)
      console.log(text)
    }
  }
  else {
    console.log("ERROR TO INSERT DATA INTO DB")
  }

}

async function sendSchemeName(ws) {

  pool.query("SELECT schemename_user FROM logschemes", (err, res) => {
    if (err) {
      console.log(err.stack)
    }
    else {
      obj = { type: "name_schemes" }
      var name_schemes = [obj].concat(res.rows)

      ws.send(JSON.stringify(name_schemes))
      console.log("los esquemas son: ", name_schemes)
    }
  })
}

////////////////////////////////////////////////////////////////////////////////

wss.on('connection', function (websocket) {
  websocket.on('close', function (websocket) {
    console.log("Client Disconnected!")
  })

  let previous_scheme
  let current_table

  var client_uuid = uuid.v4()
  var client = { 'id': client_uuid, 'ws': websocket }
  clients.push(client)
  console.log('# New client [%s] connected', client_uuid)

  sendSchemeName(websocket)

  websocket.on('message', async function incoming(message) {
    console.log("message: ", message)
    json_message = JSON.parse(message)
    //Evaulation of message
    if (json_message.min != undefined) {
      const current_scheme= json_message.scheme
      if (previous_scheme != current_scheme ){
        previous_scheme = current_scheme
        current_table = await pool.query("SELECT tablename_server FROM logschemes WHERE schemename_user = '" + current_scheme + "'")
      }
      sendDataWithPostgresSQL(client, current_table, json_message.min, json_message.include_min, json_message.max, json_message.include_max, json_message.pos)
    } else {
      insertDataIntoDB(json_message, websocket)
    }

  })
});

initialize()

// pool.query("DROP TABLE prueba", (err, res) => {
//   if (err) {
//     console.log(err)
//   } else {
//     console.log(res)
//   }
//     pool.end()
//   });