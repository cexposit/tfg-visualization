let _ = require('underscore')
let WebSocketServer = require('ws').Server
const WebSocket = require('ws')
let wss = new WebSocketServer({ port: 8181 })
let uuid = require('uuid')
const { Pool } = require('pg')

let clients

function initialize() {
  clients = []
  create_table()
}

function sendDataWithPostgresSQL(client, minimo, includemin, maximo, includemax) {

  const connectionData = {
    user: process.env.POSTGRES_USER,
    host: process.env.POSTGRES_HOST,
    database: process.env.POSTGRES_DATABASE,
    password: process.env.POSTGRES_PASSWORD
  }
  console.log(connectionData)
  const cliente = new pg.Client(connectionData);
  cliente.connect(err => {
    if (err) throw err;
    else {
      let query;
      console.log(`Running query to PostgreSQL server: ${connectionData.host}`);
      if (includemin == 'true') {
        if (includemax == 'true') {
          query = `SELECT * FROM datos WHERE time >= ${minimo} AND time <= ${maximo};`;
        }
        else {
          query = `SELECT * FROM datos WHERE time >= ${minimo} AND time < ${maximo};`;
        }
      } else {
        if (includemax == 'true') {
          query = `SELECT * FROM datos WHERE time > ${minimo} AND time <= ${maximo};`;
        }
        else {
          query = `SELECT * FROM datos WHERE time > ${minimo} AND time < ${maximo};`;
        }
      }
      cliente.query(query).then(result => {
        const rows = result.rows;
        rows.map(row => {
          const data = (JSON.stringify(row));
          client.ws.send(data);
          console.log(data)
        });
      })
        .then(() => {
          client.ws.send(JSON.stringify({
            min: minimo,
            max: maximo,
          }))
        })
        .catch(err => {
          console.log(err);
        });
    }
  })
}

function create_table() {
  const connectionString = 'postgresql://myuser:mypass@dbtimescale:5432/postgres'
  const pool = new Pool({
    connectionString,
  })
  pool.query("CREATE TABLE IF NOT EXISTS prueba(pruebaid BIGSERIAL, time date NOT NULL, entity text[] NOT NULL)", (err, res) => {

    if (err) {
      console.log(err.stack)
    }
    else {
      console.log(res);
    }
  });

  pool.query("SELECT create_hypertable('prueba','time',chunk_time_interval => 1)", (err, res) => {
    if (err) {
      console.log(err.stack)
    }
    else {
      console.log(res);
    }
    pool.end()
  })
}


function upload_data(times) {
  const connectionString = 'postgresql://myuser:mypass@dbtimescale:5432/postgres'
  const pool = new Pool({
    connectionString,
  })

  const text = 'INSERT INTO prueba(time, entity) VALUES($1, $2)'
  for (let index = 0; index < times.length; index++) {

    const values = [times[index].time, times[index].entity]

    pool.query(text, values, (err, res) => {
      if (err) {
        console.log(err.stack)
      } else {
        console.log(res.rows[0])
      }
    })

  }
  pool.end()
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

  websocket.on('message', function incoming(message) {
    console.log(message)
    times = JSON.parse(message)

    if (times && times[0]) {
      upload_data(times)
    } else {
      sendDataWithPostgresSQL(client, times.min, times.include_min, times.max, times.include_max)
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