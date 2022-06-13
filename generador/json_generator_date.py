from datetime import timedelta, date

import json
import random
import string
import sys

start_date = date.today()

if (len(sys.argv) != 4 ):
    print("Argumentos mal introducidos")

else:
    name_output = str(sys.argv[1])
    max_time = int(sys.argv[2])
    max_entities = int(sys.argv[3])
    list_ids = []
    data_json = []

    for id_names in range(max_entities):
        list_ids.append(random.choice(string.ascii_letters))

    for time in range(max_time):
        filled_entity = []
        
        for entity in range(max_entities):
            entities_value = []
            
            for x in range(max_entities):
                list = [list_ids[x], random.randint(0, 100)]
                entities_value.append(list)
                
            keys = ("id", "value")
            filled_entity = [dict(zip(keys, l)) for l in entities_value]
        
        dict_time = {
            "time": str(start_date + timedelta(days=time)),
            "entity": filled_entity
        }
        
        data_json.append(dict_time)

    with open(name_output, "w") as outfile:
        json.dump(data_json, outfile)