let _ = require('underscore')
let WebSocketServer = require('ws').Server
const WebSocket = require('ws')
let wss = new WebSocketServer({port: 8181})
let uuid = require('uuid')
const pg = require('pg');
let clients

function initialize () {
  clients = []
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

////////////////////////////////////////////////////////////////////////////////

wss.on('connection', function (websocket) {
  websocket.on('close', function (websocket) {
    console.log("Client Disconnected!")
  })
  let minimo;
  let maximo;
  let include_min;
  let include_max;
  var client_uuid = uuid.v4()
  var client = {'id': client_uuid, 'ws': websocket}
  clients.push(client)
  console.log('# New client [%s] connected', client_uuid)

  websocket.on('message', function incoming(message) {
    console.log(message)
    times = JSON.parse(message)
    console.log('times', times)
    minimo = times.min;
    maximo = times.max;
    include_min = times.include_min;
    include_max = times.include_max;
    sendDataWithPostgresSQL(client, minimo, include_min, maximo, include_max)
  })
});

initialize()