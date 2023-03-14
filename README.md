# Node Data Fetcher
Fetch data from an api and store in file, or in memory cache. 

A stripped down, dependency free version of [node-data-finder](https://github.com/lolotrgeek/node-data-finder).

## Usage
```
const { fetchData, saveData, retrieveData, isExpired } = require('node-data-requester')

// get a cat fact, but don't cache it
let result = await fetchData('https://catfact.ninja/fact', 0, false)

// save the result to file
await saveData(result, "result")

// get the result from file
await retrieveData("result")

```