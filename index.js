'use strict'

let express = require('express')

const port = process.env.PORT || 3000

app.get('/', (request, response) => {
    response.send('Hello World')
})

app.listen(port, () => {
    console.log('App started at port ' + port)
})
