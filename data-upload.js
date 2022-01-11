const pg = require('pg');
var fs = require('fs');
const resultados = []
const databases = []
const promises = []
const promise_database = []
var arguments = process.argv.slice(2)

var database = arguments[1]
var user = arguments[2]
var password = arguments[3]
var host = arguments[4]

const connectionData = {
  database: database,
  user: user,
  password: password,
  host: host,
}

const cliente = new pg.Client(connectionData);

async function checkDatabase (database) {
  cliente.connect(err => {
    const query_database = `SELECT datname FROM pg_catalog.pg_database;`
    promise_database.push(cliente.query(query_database).then(result => {
      result.rows.map(row => {
        databases.push(row.datname)
      })
    }).catch(() => {
      if (!databases.includes(database)) {
        console.log('ERROR: Database with this properties not exists')
        process.exit()
      }
    }))
  })
}

async function createTable (file) {
  const query_table = `SELECT table_name FROM information_schema.tables WHERE table_type='BASE TABLE' AND table_schema='public'`;
  cliente.query(query_table).then(result => {
    result.rows.map(row => {
      resultados.push(row.table_name)
    })
    if (!resultados.includes('datos')) {
      console.log('Creating table...')
      const query_create = `CREATE TABLE datos(time DOUBLE PRECISION, id INT, data JSONB)`;
      cliente.query(query_create)
      .catch(err => {
        console.log(err)
      })
    }
    dataUploadToTimeScale(file)
  })
}

async function dataUploadToTimeScale(file) {

  FILE_NAME = file;
  let filename = fs.readFileSync(FILE_NAME)
  try {
    let parse_json = JSON.parse(filename)
    sort(parse_json, 'time')
    console.log(parse_json)
    console.log('Inserting data into database...')
    for (var item in parse_json) {
      const query = `INSERT INTO datos VALUES(${parse_json[item].time},${parse_json[item].id},'${JSON.stringify(parse_json[item].data)}')`;
      promises.push(cliente.query(query).then(() => {
      }))
    }
    Promise.all(promises).then(() => {
      process.exit()
    })
  }
  catch {
    console.log('ERROR in input file. It is not in JSON format.')
    process.exit()
  }
}

function sort(json, key) {
  json.sort(function (a, b) {
     return a[key] > b[key];
  });
}

if (arguments.length === 5) {
  checkDatabase(arguments[1])
  Promise.all(promise_database).then(() => {
    createTable(arguments[0])
  })
}
else {
  console.log('Usage: node data-upload.js <file.json> <postgres> <postgres> <password> <localhost> \n\n<file.json>: Nombre del fichero formato json con los datos a cargar en TimeScale \n<postgres>: Nombre de la base de datos PostgreSQL \n<postgres>: Usuario asociado a la base de datos \n<postgres>: Contraseña \n<localhost>: Host')
}
