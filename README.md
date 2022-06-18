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

Mensajes enviados por el cliente:

- El cliente va a solicitar los datos al server mediante una ventana de tiempo (intervalo). Lo solicitará a través de dos campos de texto que contendrán el tiempo mínimo y el tiempo máximo, y a través de un botón, se le enviará el rango al servidor. Los mensajes que envía el cliente en este intervalo son numéricos y del tipo que quiera, ya sea entero o decimal. Ambos valores que introduzca también se incluyen en el rango, por lo que si hay algún tiempo que coincida con uno de los dos, el servidor también enviará los datos correspondientes a ese tiempo. Cuando el cliente solicite los datos al servidor, le enviará un mensaje de tipo JSON con la ventana de tiempo. Opcionalmente el cliente puede elegir si incluir o no esos valores en la ventana de tiempo. Por ejemplo, si el cliente pide los datos entre los tiempos 2.1 y 8.1, con el uso de un checkbox puede decidir si incluir ambos, si incluir alguno de ellos o por el contrario no incluir ninguno. Por lo tanto, el mensaje que el cliente le envía al servidor es el siguiente. Un JSON tiene como información el intervalo y si se incluyen o no los valores dentro del rango de tiempo. En este ejemplo en concreto el cliente decide que se incluyan ambos valores en la ventana de tiempo:
```json
{ "min": 2.1, "include_min": "true", "max": 8.1, "include_max": "true" }
```

Mensajes enviados por el servidor:

- Dependiendo del intervalo de tiempo solicitado por el cliente, el servidor enviará la información de cada uno de los tiempos con sus respectivos conjuntos de datos (color, ancho, altura...). Por ejemplo, si el cliente solicita datos en una ventana de tiempo entre 10 y 15 segundos, el servidor enviará la información correspondiente entre esos tiempos, enviando un mensaje por cada uno de los tiempos, seguido de su identificador y su conjunto de datos. A continuación se encuentra un ejemplo de la estructura de cada uno de los mensajes:

```json
"{\"time\":12.1,\"id\":1,\"data\":{\"color\":\"green\",\"width\":10.4,\"height\":20}}"
"{\"time\":10.4,\"id\":1,\"data\":{\"color\":\"green\",\"width\":20.1,\"height\":20}}"
```

También puede existir la posibilidad que hayan entidades con variables diferentes. En este caso, no va a influir mucho ya que cualquier variable será aceptada dentro del conjunto de datos que conforma cada uno de los tiempos e identificadores. Por ejemplo, en este caso ``` 8.1, 7, ' { "day": "Monday", "hour": 12, "temperature": 22.0} ' ``` tenemos una entidad con variables distintas a las demás y cuando el cliente solicita la ventana de tiempo y ese tiempo se encuentra dentro del rango, el servidor enviará sin problema alguno el mensaje con el tiempo, id y su conjunto de variables.

Además, puede existir la posibilidad que en el mismo instante de tiempo, se reciban datos de diferentes entidades. El servidor enviará esos datos, de uno en uno, enviando un mensaje por tiempo con su entidad y sus variables correspondientes.

- Cuando el cliente empiece a recibir los datos, llegará un momento en el que se debe dar cuenta que la transferencia por parte del servidor ha terminado. Por lo tanto, cuando el servidor termine de enviar los datos en su totalidad según el intervalo establecido por el cliente, le enviará un mensaje comunicando que ya ha finalizado. El mensaje será de tipo JSON y contendrá la ventana de tiempo en concreto que ha solicitado el cliente además de indicar que ya ha finalizado. En este ejemplo, el servidor le comunica al cliente que la transferencia de mensajes en la ventana de tiempo 8 - 15 ya ha terminado: 

```json
"{\"min\":8,\"max\":15}"
```

# Funcionamiento del Generador del JSON

Para generar ejemplos de JSON para hacer pruebas, se ha desarrollado un ejecutable en python para crear ficheros de ejemplo. 
Es necesario tener instalado la librería `numpy` para poder ejecutar el fichero:

 ```bash
pip3 install numpy
 ```
Su uso es el siguiente:
 ```bash
python3 generador.py -s fichero.json -i 2020-10-01 00:00:00 -f 2022-12-01 10:00:00 -t 1 y -e 2 -v 2 -a 2 2021-01-01 20:00:00
 ```
Si se quiere ver una guía de los argumentos necesarios y opcionales que se tienen que usar se pueden ver usando el argumento `-h` o `--Help`

 ```bash
python3 generador.py -h
 ```