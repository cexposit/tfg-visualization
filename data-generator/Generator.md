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
python3 data-generator.py -o salida.json -s 2020-01-01 00:00:00.000 -l 2024-01-07 23:59:59.000 -e 3000 -i 3 -v peso altura -prbn 1 -prbd 0.7 -ty 1 -tm 1
 ```
you can see all available arguments in the next list:

### Arguments

| Arg      | Type | Description |
| -------- |:----:| ----------:|
| -o --output_file | Required | Output file name |
| -s --start_date | Required | Start date of the data in the following format: 2020-02-08 09:30:23.123 - Example with a date, hour, minut, seconds and millisecond time parts |
| -l --last_date | Required | End date of the data in the following format: 2030-02-08 09:30:23.123 - Example with a date, hour, minut, seconds and millisecond time parts |
| -e --entities | Required | Max number of entities that you want to generate per day |
| -i --init_entities | Required | Number of entities that you want to generate at the start |
| -v --values | Required | Names of values that will be per entity |
| -prbn --probability_new | Optional | Optional, declare the probability to add a new entity when a event happens |
| -prbu --probability_update | Optional | Optional, declare the probability to update an entity when a event happens |
| -prbd --probability_delete | Optional | Optional, declare the probability to delete an entity when a event happens |
| -fi --first_id | Optional | Optional, declare the first id to use|
| -ty --times_year | Optional | Declare the min (required) and max (optional) amount of time to an event happens in years |
| -tm --times_month | Optional | Declare the min (required) and max (optional) amount of time to an event happens in months |
| -td --times_day | Optional | Declare the min (required) and max (optional) amount of time to an event happens in days |
| -tH --times_hour | Optional | Declare the min (required) and max (optional) amount of time to an event happens in hours |
| -tM --times_minute | Optional | Declare the min (required) and max (optional) amount of time to an event happens in minutes |
| -tS --times_second | Optional | Declare the min (required) and max (optional) amount of time to an event happens in seconds |

or using the next command:
 ```bash
python3 data-generator.py -h
 ```