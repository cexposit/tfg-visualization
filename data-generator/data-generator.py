from datetime import timedelta, datetime
# from collections import defaultdict

import argparse
import random
# import string
# import math
import json

import sys
import numpy as np

#################### Lectura de argumentos

parser = argparse.ArgumentParser(description='Program to generate a JSON file with different data, between them a time component')
parser.add_argument('-o', '--output_file', type=str, nargs=1, help='Output file name')
parser.add_argument('-n', '--name_table', type=str, nargs=1, help='Name of the table')
parser.add_argument('-s', '--start_date', type=str, nargs=2, help='Start date of the data in the following format: 2020-02-08 09:30:23.123 - Example with a date, hour, minut, seconds and millisecond time parts')
parser.add_argument('-l', '--last_date', type=str, nargs=2, help='End date of the data in the following format: 2020-02-08 09:30:23.123 - Example with a date, hour, minut, seconds and millisecond time parts')
parser.add_argument('-t', '--times', nargs=2, help='Choose in what time intervals you want it to advance: 1º number of times (1,2,3...) 2nd time unit (y / m / d / H / M / S)')
parser.add_argument('-e', '--entities', default=0, nargs='+', help='Max number of entities that you want to generate per day: 1º Number 2º Names')
parser.add_argument('-v', '--values', default=0, nargs='+', help='Max number of values ​​that will be per entity: 1º Number 2º Names')
# parser.add_argument('-f', '--fields', nargs='+', help='Name of the differents values')
parser.add_argument('-ae', '--add_entity', default="0", required=False, nargs='+', help='Optional, if you want to add a new entity at some point: 1º Number with the amount of entities to add 2º Date on which it would be added 3º names of the new entities')
parser.add_argument('-av', '--add_values', default="0", required=False, nargs='+', help='Optional, if you want to add a new value at some point: 1º Number with the amount of values to add 2º Date on which it would be added 3º names of the new fields')
parser.add_argument('-re', '--remove_entities', default="0", required=False, nargs='+', help='Optional, if you want to remove a entity at some point: 1º Date on which it would be remove 2º Names of the fields')
parser.add_argument('-rv', '--remove_values', default="0", required=False, nargs='+', help='Optional, if you want to remove a value at some point: 1º Date on which it would be remove 2º Names of the fields')

start_date = ""
last_date = ""
time_period = []
fields = []
new_entities = []
new_values = []
remove_entities = []
remove_values = []
mod_entities = []

args = parser.parse_args()
print("Ficher salida: ", args.output_file)

start_date = datetime.fromisoformat(args.start_date[0]+' '+args.start_date[1])
print("Fecha inicial: ", start_date)

last_date = datetime.fromisoformat(args.last_date[0]+' '+args.last_date[1])
print("Fecha final: ", last_date)

time_period.append(int(args.times[0]))
time_period.append(str(args.times[1]))
print("Intervalo de tiempo establecido: ", time_period)

print("Entities: ", args.entities)

print("Values: ", args.values)

if len(args.values) - 1 == int(args.values[0]):
    for n_fields in range(len(args.values)-1):
        fields.append(args.values[(n_fields)+1])
else:
    print("The number of fields isn't the same as values")
    sys.exit()
    
print("Fields: ", fields)

if len(args.add_entity) > 1:

    new_entities.append(int(args.add_entity[0]))
    new_entities.append(datetime.fromisoformat(args.add_entity[1]+' '+args.add_entity[2]))
    if (int(args.add_entity[0]) == (len(args.add_entity)-3)):
        for n_adds in range(3, len(args.add_entity)):
           new_entities.append(args.add_entity[n_adds])
    else:
        print("The number of new fields isn't the same as new values")
        sys.exit()

    print("new entities: ",new_entities)

if len(args.add_values) > 1:

    new_values.append(int(args.add_values[0]))
    new_values.append(datetime.fromisoformat(args.add_values[1]+' '+args.add_values[2]))
    if (int(args.add_values[0]) == (len(args.add_values)-3)):
        for n_adds in range(3, len(args.add_values)):
           new_values.append(args.add_values[n_adds])
    else:
        print("The number of new fields isn't the same as new values")
        sys.exit()

    print("new values: ",new_values)
    
if len(args.remove_entities) > 1:

    remove_entities.append(datetime.fromisoformat(args.remove_entities[0]+' '+args.remove_entities[1]))
    for n_removes in range(2, len(args.remove_entities)):
        remove_entities.append(args.remove_entities[n_removes])

    print("removes entities: ", remove_entities)
    
if len(args.remove_values) > 1:

    remove_values.append(datetime.fromisoformat(args.remove_values[0]+' '+args.remove_values[1]))
    for n_removes in range(2, len(args.remove_values)):
        remove_values.append(args.remove_values[n_removes])

    print("removes values: ", remove_values)

#################### Preparando variables necesarias para el algoritmo

list_ids = []
data_json = []

for id_names in range(int(args.entities[0])):
    list_ids.append(args.entities[id_names+1])

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
flag_add_value = 0
flag_add_entity = 0
flag_remove_entity = 0
flag_remove_value = 0
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

    if len(new_entities) != 0 and current_date >=new_entities[1] and flag_add_entity == 0:
        args.entities[0] = int(new_entities[0]) + int(args.entities[0])
        for i in range(int(new_entities[0])):
            list_ids.append(new_entities[i+2])
        flag_add_entity = 1

    if len(new_values) != 0 and current_date >=new_values[1] and flag_add_value == 0:
        args.values[0] = int(new_values[0]) + int(args.values[0])
        for i in range(new_values[0]):
            fields.append(new_values[(i+2)])
        flag_add_value = 1

    if len(remove_entities) != 0 and current_date >= remove_entities[0] and flag_remove_entity == 0:
        args.entities[0] -= int(len(remove_entities)-1)
        for i in range(1, len(remove_entities)):
            list_ids.remove(remove_entities[i])
        flag_remove_entity = 1    
        
    if len(remove_values) != 0 and current_date >= remove_values[0] and flag_remove_value == 0:
        args.values[0] -= int(len(remove_values)-1)
        for i in range(1, len(remove_values)):
            fields.remove(remove_values[i])
        flag_remove_value = 1

    for entity in range(int(args.entities[0])):
        entities_value = []

        for x in range(int(args.entities[0])):
            array_values = {}
            prob = np.random.choice(np.arange(0, 2), p=[0.2, 0.8])
            if prob == 1:
                for y in range(int(args.values[0])):
                    array_values[fields[y]] = (random.randint(0, 100))
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
final_json = {
    "table": args.name_table[0],
    "data": data_json
}


with open(args.output_file[0], "w") as outfile:
    json.dump(final_json, outfile)

# python3 data-generator.py -o salida.json -n Trafico -s 2020-01-01 00:00:01.000 -l 2030-12-01 23:59:59.000 -t 1 y -e 2 T1 T2 -v 2 peso altura -ae 2 2022-01-01 12:00:00.000 T3 T4 -av 2 2024-01-01 12:00:00 anchura hola -re 2026-01-01 12:00:00 T2 -rv 2028-01-01 12:00:00 hola