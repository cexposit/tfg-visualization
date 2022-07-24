# Data Visualization

# Server Websocket

## Execution

Levantar Docker:

```
./run.sh
```

Instalar / Actualizar dependencias:
```
npm install
```

Carga de datos a TimeScale:

El programa recibirá como argumento por línea de comandos el nombre del fichero tipo JSON con los datos a cargar en la base de datos. Además, el usuario deberá introducir el nombre de la base de datos, el usuario, la contraseña y el host.

```
node data-upload.js <file.json> <postgres> <postgres> <password> <localhost>
```

# Comunicación entre cliente-servidor

#### Mensajes enviados por el cliente:

- El cliente puede enviar al servidor dos mensajes. El primer mensaje se usará para almacenar en el server la información que se desea mostrar. Esto se hará especificando a través de un campo de texto con el nombre del esquema con el que se está trabajando (el cual debe ser único), junto al fichero en formato .json donde se debe encontrar toda los datos. Una vez esten ambos rellenos bastará con pulsar un boton para que este se envie al servidor.
Un ejemplo de mensaje sería el siguiente:

```json
{ name: "data", json: "{\"data\": [{\"time\": \"2020-01-01 00:00:00\", \"status\": [{\"new\": [{\"id\": \"1\", \"value\": {\"peso\": 82, \"altura\": 90}}, {\"id\": \"2\", \"value\": {\"peso\": 41, \"altura\": 82}}, {\"id\": \"3\", \"value\": {\"peso\": 49, \"altura\": 76}}]}]}, {\"time\": \"2029-01-01 00:00:00\", \"status\": [{\"new\": [{\"id\": \"4\", \"value\": {\"peso\": 3, \"altura\": 59}}], \"delete\": [{\"id\": \"1\", \"value\": {\"peso\": 10, \"altura\": 19}}]}]}]}" }
```


- El segundo mensaje cumple con la función de solicitar los datos que se quieren mostrar al server mediante una ventana de tiempo (intervalo). Lo solicitará a través de dos campos de texto que contendrán el tiempo mínimo y el tiempo máximo, y a través de un botón, se le enviará el rango al servidor. Los mensajes que envía el cliente en este intervalo son numéricos y del tipo que quiera, ya sea entero o decimal. Ambos valores que introduzca también se incluyen en el rango, por lo que si hay algún tiempo que coincida con uno de los dos, el servidor también enviará los datos correspondientes a ese tiempo. Cuando el cliente solicite los datos al servidor, le enviará un mensaje de tipo JSON con la ventana de tiempo. Opcionalmente el cliente puede elegir si incluir o no esos valores en la ventana de tiempo. Por ejemplo, si el cliente pide los datos entre los tiempos 2.1 y 8.1, con el uso de un checkbox puede decidir si incluir ambos, si incluir alguno de ellos o por el contrario no incluir ninguno. Por lo tanto, el mensaje que el cliente le envía al servidor es el siguiente. Por último se debe especificar sobre que esquema se deben obtener los datos en la franja de tiempo establecida. Esto se hará a través de un campo de selección con todos los esquemas que tiene la base de datos. Un JSON tiene como información el nombre del esquema, el intervalo y si se incluyen o no los valores dentro del rango de tiempo. En este ejemplo en concreto el cliente decide que se incluyan ambos valores en la ventana de tiempo:
```json
{"scheme":"data","min":" 2022-12-05 00:00:01.001 ","include_min":true,"max":" 2030-12-05 00:00:01.001 ","include_max":false}
```

#### Mensajes enviados por el servidor:

- El servidor envia el nombre de todos los esquemas que se encuentran en la base de datos, para que así los usuarios puedan elegir sobre cual de ellos mostrar los datos en la franja de tiempo establecida. Esto se logra enviando una lista de json , dode cada json son los susodichos esquemas, además de añadirle un json con un campo donde se especifique el mensaje que se está enviando (en este caso el nombre de los esquemas) para que así el cliente pueda identificarlo. El campo tendrá como nombre type, cuyo valor será name_tables Destacar que este mensaje se envía cada vez que se establece la conexión cliente-servidor, y cuando se añade un nuevo esquema a la base de datos.
Un ejemplo de este mensaje es el siguiente:
```python
[
    { type: 'name_schemes' },
    { tablename_user: 'test' },
    { tablename_user: 'prueba' },
    { tablename_user: 'testing' },
    { tablename_user: 'prueba2' },
    { tablename_user: 'data' }
]
```

- Dependiendo del intervalo de tiempo solicitado por el cliente, el servidor enviará la información de cada uno de los tiempos con sus respectivos conjuntos de datos (peso, altura...). Por ejemplo, si el cliente solicita datos en una ventana de tiempo entre 2020-01-01 00:00:00.000 y 2030-01-01 00:00:00.000, el servidor enviará la información correspondiente entre esos tiempos, enviando un mensaje por cada uno de los tiempos, seguido de su identificador y su conjunto de datos. Por último al igual que al primer mensaje, se le añadirá un campo con que el cliente pueda identificarlo del resto de mensajes. En este caso será campo que llamaremos type el cual tendrá como valor query. A continuación se encuentra un ejemplo de la estructura de cada uno de los mensajes:

```json
{"time": "2020-01-01T00:00:00.000Z", "status": [ "{\"new\":[{\"id\":\"1\",\"value\":{\"peso\":82,\"altura\":90}},{\"id\":\"2\",\"value\":{\"peso\":41,\"altura\":82}},{\"id\":\"3\",\"value\":{\"peso\":49,\"altura\":76}}]}" ], "type": "query" }
{"time": "2029-01-01T00:00:00.000Z", "status": [ "{\"new\":[{\"id\":\"4\",\"value\":{\"peso\":3,\"altura\":59}}],\"delete\":[{\"id\":\"1\",\"value\":{\"peso\":10,\"altura\":19}}]}" ], "type": "query" } 
```

También puede existir la posibilidad que hayan entidades con variables diferentes. En este caso, no va a influir mucho ya que cualquier variable será aceptada dentro del conjunto de datos que conforma cada uno de los tiempos e identificadores. Por ejemplo, en este caso ``` 8.1, 7, ' { "day": "Monday", "hour": 12, "temperature": 22.0} ' ``` tenemos una entidad con variables distintas a las demás y cuando el cliente solicita la ventana de tiempo y ese tiempo se encuentra dentro del rango, el servidor enviará sin problema alguno el mensaje con el tiempo, id y su conjunto de variables.
<!-- 
Además, puede existir la posibilidad que en el mismo instante de tiempo, se reciban datos de diferentes entidades. El servidor enviará esos datos, de uno en uno, enviando un mensaje por tiempo con su entidad y sus variables correspondientes.

- Cuando el cliente empiece a recibir los datos, llegará un momento en el que se debe dar cuenta que la transferencia por parte del servidor ha terminado. Por lo tanto, cuando el servidor termine de enviar los datos en su totalidad según el intervalo establecido por el cliente, le enviará un mensaje comunicando que ya ha finalizado. El mensaje será de tipo JSON y contendrá la ventana de tiempo en concreto que ha solicitado el cliente además de indicar que ya ha finalizado. En este ejemplo, el servidor le comunica al cliente que la transferencia de mensajes en la ventana de tiempo 8 - 15 ya ha terminado:  

```json
"{\"min\":8,\"max\":15}"
```
-->