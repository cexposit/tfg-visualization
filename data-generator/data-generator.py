from datetime import timedelta, datetime

import argparse
import random
import json

import numpy as np

parser = argparse.ArgumentParser(description='Program to generate a JSON file with different data, between them a time component')
parser.add_argument('-o', '--output_file', type=str, help='Output file name')

parser.add_argument('-s', '--start_date', type=str, nargs=2, help='Start date of the data in the following format: 2020-02-08 09:30:23.123 - Example with a date, hour, minut, seconds and millisecond time parts')
parser.add_argument('-l', '--last_date', type=str, nargs=2, help='End date of the data in the following format: 2020-02-08 09:30:23.123 - Example with a date, hour, minut, seconds and millisecond time parts')

parser.add_argument('-e', '--entities', type=int, help='Max number of entities that you want to generate per day')
parser.add_argument('-i', '--init_entities', type=int, help='Number of entities that you want to generate at the start')
parser.add_argument('-v', '--values', nargs='+', help='Names of values that will be per entity')

parser.add_argument('-prbn', '--probability_new', type=float, default=1, required=False, help='Optional, declare the probability to add a new entity when a event happens')
parser.add_argument('-prbu', '--probability_update', type=float, default=0.5, required=False, help='Optional, declare the probability to update an entity when a event happens')
parser.add_argument('-prbd', '--probability_delete', type=float, default=0.5, required=False, help='Optional, declare the probability to delete an entity when a event happens')

parser.add_argument('-tm', '--times_month', required=False, help='Declare the min amount of time to an event happens')
parser.add_argument('-td', '--times_day', required=False, help='Declare the min amount of time to an event happens')
parser.add_argument('-tH', '--times_hour', required=False, help='Declare the min amount of time to an event happens')
parser.add_argument('-tmn', '--times_min', required=False, help='Declare the min and max amount of time to an event happens')
parser.add_argument('-tmx', '--times_max', required=False, help='Declare the min and max amount of time to an event happens')


args = parser.parse_args()
# print("Ficher salida: ", args.output_file)

start_date = datetime.fromisoformat(args.start_date[0]+' '+args.start_date[1])
# print("Fecha inicial: ", start_date)

end_date = datetime.fromisoformat(args.last_date[0]+' '+args.last_date[1])
# print("Fecha final: ", end_date)
 
current_entities = 0

def event_generator(id, amount):
    event_list = []
    for _ in range(amount):
        id += 1
        event = {}
        values = {}
        event["id"] = str(id)
        for value in range(len(args.values)):
            values[args.values[value]] = (random.randint(0, 100))
        event["value"] = values
        event_list.append(event)
    return event_list

def status_generator(new, update, delete, amount, deleted):
    global current_entities
    status = {}
    
    is_new = np.random.choice(np.arange(0, 2), p=[(1.0-new), new])
    is_update = np.random.choice(np.arange(0, 2), p=[(1.0-update), update])
    is_delete = np.random.choice(np.arange(0, 2), p=[(1.0-delete), delete])
    
    if is_new:
        status["new"] = event_generator(current_entities, amount)
    
    if is_delete:
        id_deleted = random.randint(1, current_entities)
        while id_deleted == current_entities or id_deleted in deleted:
            id_deleted = random.randint(1, current_entities)
        deleted.append(id_deleted)        
        status["delete"] =  event_generator(id_deleted, 1)
    
    if is_update:
        id_update = random.randint(1, current_entities)
        while id_update == current_entities or id_update in deleted:
            id_update = random.randint(1, current_entities)
        status["update"] = event_generator(id_update, 1)
           
    current_entities+=amount
    return status

def generator(first_date, last_date):
    current_time = first_date
    data = []
    deleted = []
    time = 1
    while current_time < last_date:
        if current_time == first_date:
            amount = args.init_entities
            status = status_generator(1, 0, 0, amount, deleted)
        else:
            amount = 1
            status = status_generator(args.probability_new, args.probability_update, args.probability_delete, amount,deleted )
            
        action = {
            "time": str(current_time),
            "status": status
        }
        data.append(action)
        current_time = first_date + timedelta(days = time * 365)
        time+=1
    return data



data = generator(start_date, end_date)

final_json = {
    "data": data
}
with open(args.output_file, "w") as outfile:
    json.dump(final_json, outfile)






# python3 data-generator2.py -o salida2.json -s 2020-01-01 00:00:01.000 -l 2030-12-01 23:59:59.000 -e 10000 -i 3 -v peso altura -prbn 1 -prbu 0.7 -prbd 0.7 -tmn 10 -tmx 20

# python3 data-generator2.py -o salida.json -s 2020-01-01 00:00:01.000 -l 2030-12-01 23:59:59.000 -e 10000 -i 3 -v peso altura -prbn 0.7 -prbu 0.3 -prbd 2 -tmx 00:30:00.000 -tmn 01:00:00.000