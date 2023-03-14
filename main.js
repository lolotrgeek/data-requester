const https = require('https')
const { writeFile, readFile } = require('fs').promises
const { join } = require('path')

// Create an object to hold cached responses
const cache = {}

const isExpired = expires => Date.now() > expires ? expires !== 0 ? true : false : false

const JsonParser = (data) => {
    try {
        return JSON.parse(data)
    } catch (error) {
        return error
    }
}


const appendData = (existing, adding) => {
    let data = JsonParser(existing)
    data = [...data, ...adding]
    return JSON.stringify(data)
}

async function retrieveData(filename) {
    let file = join(__dirname, `/data/${filename}.json`)
    try {
        let read = await readFile(file, 'utf8')
        console.log("Retrieved Cached Data...")
        return JsonParser(read)
    } catch (error) {
        return error
    }
}

async function saveData(data, filename, append = false) {
    let file = join(__dirname, `/data/${filename}.json`)
    try {
        let read = await readFile(file, 'utf8')
        if(append === true) await writeFile(file, appendData(read, JSON.stringify(data)), 'utf8')
        return await writeFile(file, JSON.stringify(data), 'utf8')
    } catch (error) {
        try {
            await writeFile(file, JSON.stringify(data), 'utf8')
            return "success"
        } catch (error2) {
            return [error, error2]
        }
    }
}

/**
 * 
 * @param {string} url 
 * @param {number} expires 
 * @param {boolean} caching 
 * @param {boolean} debug 
 * @returns 
 */
function fetchData(url, expires = 0, caching = true, debug = false) {
    return new Promise((resolve, reject) => {
        // Check if the response is already cached
        if (caching && cache[url] && !isExpired(cache[url].expires)) {
            if (debug === 'caching' || debug === 'info') console.log(`Returning cached response for ${url}`)
            return cache[url].data
        }

        // If not cached, make a new request to the API
        if (debug === 'info') console.log(`Fetching response for ${url}`)
        https.get(url, (res) => {
            let data = ''

            res.on('data', (chunk) => {
                data += chunk
            })

            res.on('close', () => {
                // Store the response in the cache
                let entry = { data: JsonParser(data), expires }
                if (caching) {
                    if (debug === 'caching' || debug === 'info') console.log(`Caching response for ${url}`)
                    cache[url] = entry
                }
                // Return the response
                if (expires > 0) resolve(entry)
                resolve(entry.data)
            })
        }).on('error', (err) => {
            if (debug === 'error') throw { url, err }
            console.log(`Error fetching response for ${url}: ${err.message}`)

            reject(null, err)
        })
    })
}

module.exports = { fetchData, retrieveData, saveData, isExpired }