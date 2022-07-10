let _ = require('underscore')
let WebSocketServer = require('ws').Server
const WebSocket = require('ws')
let wss = new WebSocketServer({ port: 8181 })
let uuid = require('uuid')
const { Pool } = require('pg')

let clients

function initialize() {
  clients = []
  // create_table()

}

function sendDataWithPostgresSQL(client, tabla,  minimo, includemin, maximo, includemax) {

  // const connectionData = {
  //   user: process.env.POSTGRES_USER,
  //   host: process.env.POSTGRES_HOST,
  //   database: process.env.POSTGRES_DATABASE,
  //   password: process.env.POSTGRES_PASSWORD
  // }
  // console.log(connectionData)
  // const cliente = new pg.Client(connectionData);

  const connectionString = 'postgresql://myuser:mypass@dbtimescale:5432/postgres'
  const cliente = new Pool({
    connectionString,
  })

  cliente.connect(err => {
    if (err) throw err;
    else {
      let query;
      // console.log(`Running query to PostgreSQL server: ${connectionData.host}`);
      if (includemin == true) {
        if (includemax == true) {
          query =`SELECT * FROM ${tabla} WHERE time >= to_timestamp('`+minimo+"', 'YYYY-MM-DD hh24:mi:ss')::timestamp without time zone AND time <= to_timestamp('"+maximo+"', 'YYYY-MM-DD hh24:mi:ss')::timestamp without time zone;";
        }
        else {
          query =`SELECT * FROM ${tabla} WHERE time >= to_timestamp('`+minimo+"', 'YYYY-MM-DD hh24:mi:ss')::timestamp without time zone AND time < to_timestamp('"+maximo+"', 'YYYY-MM-DD hh24:mi:ss')::timestamp without time zone;";
        }
      } else {
        if (includemax == true) {
          query =`SELECT * FROM ${tabla} WHERE time > to_timestamp('`+minimo+"', 'YYYY-MM-DD hh24:mi:ss')::timestamp without time zone AND time <= to_timestamp('"+maximo+"', 'YYYY-MM-DD hh24:mi:ss')::timestamp without time zone;";
        }
        else {
          query =`SELECT * FROM ${tabla} WHERE time > to_timestamp('`+minimo+"', 'YYYY-MM-DD hh24:mi:ss')::timestamp without time zone AND time < to_timestamp('"+maximo+"', 'YYYY-MM-DD hh24:mi:ss')::timestamp without time zone;";
        }
      }
      cliente.query(query).then(result => {
        const rows = result.rows;
        
        rows.forEach(row => {
            const newRow = row
            newRow["type"]="query"
  
            const data = (JSON.stringify(newRow));
            console.log("query result: ", data)
            client.ws.send(data);
          });
      })
      .then(() => {
          const filters = {}
          filters["type"]="filters"
          filters["min"]=minimo
          filters["max"]= maximo
        
          client.ws.send(JSON.stringify(filters))
        })
        .catch(err => {
          console.log(err);
        });
    }
  })
}

async function create_table(table_name, ws) {
  const connectionString = 'postgresql://myuser:mypass@dbtimescale:5432/postgres'
  const pool = new Pool({
    connectionString,
  })
  await pool.query('CREATE TABLE IF NOT EXISTS ' + table_name + '(pruebaid BIGSERIAL, time TIMESTAMPTZ NOT NULL, entity text[] NOT NULL)') 

  const res = await pool.query("SELECT create_hypertable('" + table_name + "','time')")
}

async function insertDataIntoDB(json_msg, ws) {
  const connectionString = 'postgresql://myuser:mypass@dbtimescale:5432/postgres'
  const pool = new Pool({
    connectionString,
  })

  let table_from_msg = json_msg.table
  table_from_msg = table_from_msg.toLowerCase().trim()

  const res = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public'AND table_type='BASE TABLE'")
  if (res) {
    let all_tables = JSON.stringify(res.rows)

    if (!all_tables.includes(table_from_msg)) {
      console.log("no existe la tabla")
      await create_table(json_msg.table, ws)
      await sendTableName(ws)
    }

    const text = 'INSERT INTO ' + json_msg.table + '(time, entity) VALUES($1, $2)'
    for (let index = 0; index < json_msg.data.length; index++) {
      const values = [json_msg.data[index].time, json_msg.data[index].entity]
      await pool.query(text, values)
      console.log(text)
    }
    pool.end()
  }
  else{
    console.log("ERROR TO INSERT DATA INTO DB")
    pool.end()
  }

}

async function sendTableName(ws) {
  const connectionString = 'postgresql://myuser:mypass@dbtimescale:5432/postgres'
  const pool = new Pool({
    connectionString,
  })

  pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public'AND table_type='BASE TABLE'", (err, res) => {
    if (err) {
      console.log(err.stack)
    }
    else {
      obj = {type: "name_tables"}
      var name_tables = [obj].concat(res.rows)
      // console.log(name_tables)
      // console.log(JSON.stringify(name_tables))
      ws.send(JSON.stringify(name_tables))
    }
    pool.end()
  })
}

////////////////////////////////////////////////////////////////////////////////

wss.on('connection', function (websocket) {
  websocket.on('close', function (websocket) {
    console.log("Client Disconnected!")
  })

  
  var client_uuid = uuid.v4()
  var client = { 'id': client_uuid, 'ws': websocket }
  clients.push(client)
  console.log('# New client [%s] connected', client_uuid)

  sendTableName(websocket)

  websocket.on('message', function incoming(message) {
    console.log("message: ", message)
    // prueba = JSON.stringify(message)
    json_message = JSON.parse(message)
    //Evaulation of message
    if (json_message.min != undefined) {
      sendDataWithPostgresSQL(client, json_message.table, json_message.min, json_message.include_min, json_message.max, json_message.include_max)
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