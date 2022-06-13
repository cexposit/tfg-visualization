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

  for (let index = 0; index < jsonObject.length; index++) {
    const element = jsonObject[index];
    console.log(element)
    
  }