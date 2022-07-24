from datetime import timedelta, datetime
from dateutil.relativedelta import relativedelta

import argparse
import random
import json
import sys

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

parser.add_argument('-ty', '--times_year', required=False, nargs = '+',help='Declare the min (required) and max (optional) amount of time to an event happens in years')
parser.add_argument('-tm', '--times_month', required=False, nargs = '+',help='Declare the min (required) and max (optional) amount of time to an event happens in months')
parser.add_argument('-td', '--times_day', required=False, nargs = '+',help='Declare the min (required) and max (optional) amount of time to an event happens in days')
parser.add_argument('-tH', '--times_hour', required=False, nargs = '+',help='Declare the min (required) and max (optional) amount of time to an event happens in hours')
parser.add_argument('-tM', '--times_min', required=False, nargs = '+',help='Declare the min (required) and max (optional) amount of time to an event happens in minutes')
parser.add_argument('-tS', '--times_sec', required=False, nargs = '+',help='Declare the min (required) and max (optional) amount of time to an event happens in seconds')

args = parser.parse_args()

# print("Ficher salida: ", args.output_file)

start_date = datetime.fromisoformat(args.start_date[0]+' '+args.start_date[1])
# print("Fecha inicial: ", type (start_date))

end_date = datetime.fromisoformat(args.last_date[0]+' '+args.last_date[1])
# print("Fecha final: ", end_date)
 
total_entities = 0

def event_generator(id):
    event = {}
    values = {}
    event["id"] = str(id)
    for value in range(len(args.values)):
        values[args.values[value]] = (random.randint(0, 100))
    event["value"] = values
    return (event)


def status_generator(new, update, delete, amount, deleted):
    global total_entities
    current_entity = 0
    status = []
    status_propertie = {}
    
    is_new = np.random.choice(np.arange(0, 2), p=[(1.0-new), new])
    is_update = np.random.choice(np.arange(0, 2), p=[(1.0-update), update])
    is_delete = np.random.choice(np.arange(0, 2), p=[(1.0-delete), delete])
    
    if is_new == 1 and total_entities < args.entities:
        event_list = []
        for _ in range(1, amount+1):
            total_entities+=1
            event_list.append(event_generator(total_entities))
        current_entity = total_entities
        status_propertie["new"] = event_list         
        
    if is_delete:
        if total_entities == len(deleted):
            pass
        else:
            event_list = []
            id_deleted = random.randint(1, total_entities)
            while id_deleted == current_entity or id_deleted in deleted:
                id_deleted = random.randint(1, total_entities)
            deleted.append(id_deleted)
            event_list.append(event_generator(id_deleted))
            status_propertie["delete"] = event_list
            id_deleted = random.randint(1, total_entities)
        
    if is_update:
        if total_entities == len(deleted):
            pass
        else:
            event_list = []
            id_update = random.randint(1, total_entities)
            while id_update == current_entity or id_update in deleted:
                id_update = random.randint(1, total_entities)
            event_list.append(event_generator(id_update))
            status_propertie["update"] = event_list
    status.append(status_propertie)
            
           
    return status

def frame_time(current_time):
    
    if args.times_year:
        if len (args.times_year) == 1:
            current_time = current_time + relativedelta(years=(int(args.times_year[0])))
        elif len (args.times_year) == 2:
            current_time = current_time + relativedelta(years=random.randint(int(args.times_year[0]), int(args.times_year[1])))
        else:
            print("You can only use max 2 values")   
            sys.exit()
               
    if args.times_month:
        if len (args.times_month) == 1:
            current_time = current_time + relativedelta(months=(int(args.times_month[0])))
        elif len (args.times_month) == 2:
            current_time = current_time + relativedelta(months=random.randint(int(args.times_month[0]), int(args.times_month[1])))
        else:
            print("You can only use max 2 values")   
            sys.exit()
                 

    if args.times_day:
        if len (args.times_day) == 1:
            current_time = current_time + relativedelta(days=(int(args.times_day[0])))
        elif len (args.times_day) == 2:
            current_time = current_time + relativedelta(days=random.randint(int(args.times_day[0]), int(args.times_day[1])))
        else:
            print("You can only use max 2 values")   
            sys.exit()
            

    if args.times_hour:
        if len (args.times_hour) == 1:
            current_time = current_time + relativedelta(hours=(int(args.times_hour[0])))
        elif len (args.times_hour) == 2:
            current_time = current_time + relativedelta(hours=random.randint(int(args.times_hour[0]), int(args.times_hour[1])))
        else:
            print("You can only use max 2 values")   
            sys.exit()
            

    if args.times_min:
        if len (args.times_min) == 1:
            current_time = current_time + relativedelta(minutes=(int(args.times_min[0])))
        elif len (args.times_min) == 2:
            current_time = current_time + relativedelta(minutes=random.randint(int(args.times_min[0]), int(args.times_min[1])))
        else:
            print("You can only use max 2 values")   
            sys.exit()
            

    if args.times_sec:
        if len (args.times_sec) == 1:
            current_time = current_time + relativedelta(seconds=(int(args.times_sec[0])))
        elif len (args.times_sec) == 2:
            current_time = current_time + relativedelta(seconds=random.randint(int(args.times_sec[0]), int(args.times_sec[1])))
        else:
            print("You can only use max 2 values")   
            sys.exit()
            

    return current_time

def generator(first_date, last_date):
    current_time = first_date
    data = []
    deleted = []
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

        current_time = frame_time(current_time)
        
    return data

data = generator(start_date, end_date)

final_json = {
    "data": data
}
with open(args.output_file, "w") as outfile:
    json.dump(final_json, outfile)




# python3 data-generator2.py -o salida2.json -s 2020-01-01 00:00:01.000 -l 2030-12-01 23:59:59.000 -e 10000 -i 3 -v peso altura -prbn 1 -prbu 0.7 -prbd 0.7 -tmn 10 -tmx 20

# python3 data-generator2.py -o salida.json -s 2020-01-01 00:00:01.000 -l 2030-12-01 23:59:59.000 -e 10000 -i 3 -v peso altura -prbn 0.7 -prbu 0.3 -prbd 2 -tmx 00:30:00.000 -tmn 01:00:00.000