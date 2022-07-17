# Data Generator
--------------------------

In this project we will need a series of JSON files to test the operation of our web application. For this we will use the Python program data-generator.py which generates a JSON based on the arguments it receives

## Build
To use this program you will need install the library `numpy`. You can do it with thw next command:

 ```bash
pip3 install numpy
 ```
 
## Execution
To make this program works you must use the next command:
 ```bash
python3 data-generator.py -o salida.json -n Trafico -s 2020-01-01 00:00:01.000 -l 2030-12-01 23:59:59.000 -t 1 y -e 2 T1 T2 -v 2 peso altura -ae 2 2022-01-01 12:00:00.000 T3 T4 -av 2 2024-01-01 12:00:00 anchura hola -re 2026-01-01 12:00:00 T2 -rv 2028-01-01 12:00:00 hola
 ```
you can see all available arguments in the next list:

### Arguments

| Arg      | Type | Description |
| -------- |:----:| ----------:|
| -o --output_file | Required | Output file name |
| -n --name_table | Required | Name of the table |
| -s --start_date | Required | Start date of the data in the following format: 2020-02-08 09:30:23.123 - Example with a date, hour, minut, seconds and millisecond time parts |
| -l --last_date | Required | End date of the data in the following format: 2030-02-08 09:30:23.123 - Example with a date, hour, minut, seconds and millisecond time parts |
| -t --times | Required | Choose in what time intervals you want it to advance: 1º number of times (1,2,3...) 2nd time unit (y / m / d / H / M / S) |
| -e --entities | Required | Max number of entities that you want to generate per day: 1º Number 2º Names |
| -v --values | Required | Max number of values that will be per entity: 1º Number 2º Names |
| -ae --add_entity | Optional | Optional, if you want to add a new entity at some point: 1º Number with the amount of entities to add 2º Date on which it would be added 3º names of the new entities |
| -av --add_values | Optional | Optional, if you want to add a new value at some point: 1º Number with the amount of values to add 2º Date on which it would be added 3º names of the new fields |
| -re --remove_entities | Optional | Optional, if you want to remove a entity at some point: 1º Date on which it would be remove 2º Names of the fields |
| -rv --remove_values | Optional | Optional, if you want to remove a value at some point: 1º Date on which it would be remove 2º Names of the fields |

or using the next command:
 ```bash
python3 data-generator.py -h
 ```