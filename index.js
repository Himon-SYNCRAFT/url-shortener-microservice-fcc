'use strict'

let express = require('express')
let MongoClient = require('mongodb').MongoClient

const connectionString = 'mongodb://anon:anon@ds143777.mlab.com:43777/short_urls'
const port = process.env.PORT || 3000

let app = express()

function isValidUrl(url) {
    return /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})).?)(?::\d{2,5})?(?:[/?#]\S*)?$/i.test(url)
}

app.get('/', (request, response) => {
    response.send('hello')
})

app.get('/add/*', (request, response) => {
    response.setHeader('Content-Type', 'application/json')

    let url = request.params[0]
    let r

    if (!url || !isValidUrl(url)) {
        r = { error: 'Ivalid URL' }
        response.send(JSON.stringify(r))
        return
    }

    MongoClient.connect(connectionString, (err, db) => {
        let collection = db.collection('urls')
        let options = { "sort": [['uid', 'desc']] }
        let uid = 1

        collection.findOne({},options, (err, item) => {
            if (item) {
                uid = item.uid
                uid++
            }

            collection.insertOne({uid, url}, (err, r) => {
                db.close()
                let short_url = request.protocol + '://' + request.get('host') + '/' + uid
                r = { original_url: url, short_url }
                response.send(JSON.stringify(r))
            })
        })
    })
})

app.get('/:id', (request, response) => {
    response.setHeader('Content-Type', 'application/json')

    let uid = parseInt(request.params.id)

    MongoClient.connect(connectionString, (err, db) => {
        let collection = db.collection('urls')
        collection.findOne({uid}, (err, item) => {
            if (item) {
                response.redirect(item.url)
            } else {
                response.send({error: 'Not found'})
            }
        })
    })
})

app.listen(port, () => {
    console.log('App started at port ' + port)
})
