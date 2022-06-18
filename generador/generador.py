from datetime import timedelta, datetime
import random
import string
import math
import json

import sys
import numpy as np


# Options

# Long options

output_file = ""
start_date = ""
last_date = ""
time_period = []
entities = ""
values = ""
news_entities = []

#################### Lectura de argumentos

if (sys.argv[1] == "-h" or sys.argv[1] == "--Help"):
    print("El programa tiene una serie de argumentos obligatorios a rellenar en el mismo orden:")
    print("\t -s || --Salida_fichero => Nombre de salida del fichero")
    print("\t -i || --Fecha_inicial => Fecha de inicio de los datos con el siguiente formato: <año-mes-dia hora:minuto:segundos>")
    print("\t -f || --Fecha_final => Fecha final de los datos con el siguiente formato: <año-mes-dia hora:minuto:segundos>")
    print("\t -t || --Intervalo_tiempo => Decidir en que intervalos de tiempo se quiere que avance: 1º numero de tiempo (1,2,3...) 2º unidad de tiempo(y / m / d / H / M / S)")
    print("\t -e || --Entidades => Cantidad de entidades que se quiere generar por dia")
    print("\t -v || --Valores => Cantidad de valores que habra por item")
    print("\t -a || --Add => Opcional, si se quisiera añadir una nueva entidad en algún momento: 1º Numero con la cantidad de entidades a añadir 2º Fecha en la que se añadiría")

else:
    if (sys.argv[1] == "-s" or sys.argv[1] == "--Salida_fichero"):
        output_file = sys.argv[2]
        print("Fichero de salida:", output_file)
    else:
        print("Argumentos incorrectos")
        sys.exit()

    if (sys.argv[3] == "-i" or sys.argv[3] == "--Fecha_inicial"):
        start_date = datetime.fromisoformat(sys.argv[4]+' '+sys.argv[5])
        print("Fecha inicial: ", start_date)
    else:
        print("Argumentos incorrectos")
        sys.exit()

    if (sys.argv[6] == "-f" or sys.argv[6] == "--Fecha_final"):
        last_date = datetime.fromisoformat(sys.argv[7]+' '+sys.argv[8])
        print("Fecha final: ", last_date)
    else:
        print("Argumentos incorrectos")
        sys.exit()

    if (sys.argv[9] == "-t" or sys.argv[9] == "--Intervalo_tiempo"):
        time_period.append(int(sys.argv[10]))
        time_period.append(sys.argv[11])
        print("Intervalo de tiempo establecido: ", time_period)
    else:
        print("Argumentos incorrectos")
        sys.exit()

    if (sys.argv[12] == "-e" or sys.argv[12] == "--Entidades"):
        entities = int(sys.argv[13])
        print("Numero de entidades establecidas: ", entities)
    else:
        print("Argumentos incorrectos")
        sys.exit()
        
    if (sys.argv[14] == "-v" or sys.argv[14] == "--Valores"):
        values = int(sys.argv[15])
        print("Cantidad de valores por entidad: ", values)
    else:
        print("Argumentos incorrectos")
        sys.exit()
    if len(sys.argv) > 16:
        if (sys.argv[16] == "-a" or sys.argv[16] == "--Add"):
            news_entities.append(int(sys.argv[17]))
            news_entities.append(datetime.fromisoformat(
                sys.argv[18]+' '+sys.argv[19]))
            print("Nuevas entidades a añadir: ", news_entities)

#################### Preparando variables necesarias para el algoritmo

    list_ids = []
    data_json = []

    for id_names in range(entities):
        list_ids.append(random.choice(string.ascii_letters))

    dif_time = last_date - start_date
    max_time = ""
    if time_period[1] == "y":
        max_time = round(dif_time.days / 365)

    elif time_period[1] == "m":
        max_time = round(dif_time.days / 30)

    elif time_period[1] == "d":
        max_time = dif_time.days

    elif time_period[1] == "H":
        max_time = dif_time.seconds/3600

    elif time_period[1] == "M":
        max_time = dif_time.seconds/60

    elif time_period[1] == "S":
        max_time = dif_time.seconds

#################### Creando los datos del JSON


    current_date = start_date
    time = 0
    flag_add_entity = 0
    while time <= int(max_time) or current_date != last_date:

        if time_period[1] == 'y':
            current_date = start_date + timedelta(days=time*365)
        elif time_period[1] == 'm':
            current_date = start_date + timedelta(days=time*30)
        elif time_period[1] == 'd':
            current_date = start_date + timedelta(days=time)
        elif time_period[1] == 'H':
            current_date = start_date + timedelta(hours=time)
        elif time_period[1] == 'M':
            current_date = start_date + timedelta(minutes=time)
        elif time_period[1] == 'S':
            current_date = start_date + timedelta(seconds=time)
        if time > max_time:
            current_date = last_date
        filled_entity = []

        if len(news_entities) != 0 and current_date >= news_entities[1] and flag_add_entity == 0:
            entities += news_entities[0]
            for i in range(news_entities[0]):
                list_ids.append(random.choice(string.ascii_letters))
            flag_add_entity = 1

        for entity in range(entities):
            entities_value = []

            for x in range(entities):
                array_values = []
                prob = np.random.choice(np.arange(0, 2), p=[0.2, 0.8])
                if prob == 1:
                    for y in range(values):
                        array_values.append(random.randint(0, 100))
                list = [list_ids[x], array_values]
                entities_value.append(list)

            keys = ("id", "value")
            filled_entity = [dict(zip(keys, l)) for l in entities_value]
        dict_time = {
            "time": str(current_date),
            "entity": filled_entity
        }
        time += time_period[0]
        data_json.append(dict_time)
        
#################### Creación del JSON


    with open(output_file, "w") as outfile:
        json.dump(data_json, outfile)
