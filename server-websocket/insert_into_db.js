const { Pool } = require('pg')
// const pool = new Pool({
//   user: 'myuser',
//   host: '0.0.0.0',
//   database: 'postgres',
//   password: 'mypass',
//   port: 5432,
// })

var jsonObject = 
  [
    {
      "time": 0,
      "entity": [
        {
          "id": "p",
          "value": 39
        },
        {
          "id": "s",
          "value": 20
        }
      ]
    },
    {
      "time": 1,
      "entity": [
        {
          "id": "p",
          "value": 37
        },
        {
          "id": "s",
          "value": 5
        }
      ]
    }
  ]


  const text= 'INSERT INTO prueba(time, entity) VALUES($1, $2)'
  const values= [1, [{"id": "p","value": 9},{"id": "s", "value": 2}]]


//[{"id": "p","value": 39},{"id": "s", "value": 20}]

const connectionString = 'postgresql://myuser:mypass@localhost:5432/postgres'
const pool = new Pool({
  connectionString,
})

for (let index = 0; index < jsonObject.length; index++) {
  const element = array[index];
  
}

pool.query("CREATE TABLE prueba(pruebaid BIGSERIAL, time integer NOT NULL, entity text[] NOT NULL)", (err, res) => {
  
  if (err) {
    console.log(err.stack)
    console.log('NOFINO1')
  }
  else{
    console.log('YOQUESE');
    console.log(res);
  }
});

pool.query("SELECT create_hypertable('prueba','time',chunk_time_interval => 1)", (err, res) => {
  if (err) {
    console.log(err.stack)
    console.log('NOFIN2')
  }
  else{
    console.log('FINO');
    console.log(res);
  }
})

// pool.query("DROP TABLE prueba", (_, res) => {
  //   console.log('SEBORRO');
  //   console.log(res);
  // });
  
  pool.query(text, values, (err, res) => {
    if (err) {
      console.log(err.stack)
    } else {
      console.log(res.rows[0])
    }
  })
  
  pool.query('SELECT entity FROM prueba', (_, res) => {
      console.log(res.rows[0])
      pool.end()
    })