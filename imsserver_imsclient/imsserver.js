'use strict';

const express = require('express');

// Constants
const PORT = process.env.PORT || 8080;
const HOST = '0.0.0.0';

// App
const app = express();

// Features for JSON Body
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Entrypoint - call it with: http://localhost:8080/
app.get('/', (req, res) => {
    console.log("Got a request on Homepage");
    res.redirect('/Home');
});

// Another GET Path - call it with: http://localhost:8080/s
app.get('/s', (req, res) => {
    console.log("Got a request on Stock XX");
    res.redirect('/Stock');
});

// Another GET Path that shows the actual Request (req) Headers - call it with: http://localhost:8080/request_info
app.get('/request_info', (req, res) => {
    console.log("Request content:", req)
    res.send('This is all I got from the request:' + JSON.stringify(req.headers));
});

// POST Path - call it with: POST http://localhost:8080/client_post
app.post('/client_post', (req, res) => {
    if (typeof req.body !== "undefined" && typeof req.body.post_content !== "undefined") {
        var post_content = req.body.post_content;
        console.log("Client send 'post_content' with content:", post_content)
        // Set HTTP Status -> 200 is okay -> and send message
        res.status(200).json({ message: 'I got your message: ' + post_content });
    }
    else {
        // There is no body and post_contend
        console.error("Client send no 'post_content'")
        //Set HTTP Status -> 400 is client error -> and send message
        res.status(400).json({ message: 'This function requries a body with "post_content"' });
    }
});

// All requests to /static/... will be reidrected to static files in the folder "public"
// call it with: http://localhost:8080/Home
app.use('/Home', express.static('home'));
app.use('/Stock', express.static('stock'));

// Start the actual server
app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);

/**
 * Maxim Part
 */

//Aufbauen verbindung Influxdb
const InfluxDB = require('influx');
const influxdb = new InfluxDB.InfluxDB({
    host  : "localhost",
    //port  : "8086",
   database : "aktiendb"
  })

//Aufbauen verbindung imsdb

const mariadb = require('mariadb');
var mariadbcon = mariadb.createPool({
  host: "localhost",
  user: "secureuser",
  password: "securepassword",
  port: 3308,
  database: "imsdb"
})

mariadbcon.getConnection().then(conn =>  {
    console.log("Connected!"); });

influxdb.getDatabaseNames().then(function(value) {
    console.log('Connected Influx')
    //wenn das erste mal gestartet muss Datenbank eingerichtet werden
    if(!value.includes('aktiendb')) {
        influxdb.createDatabase('aktiendb');
        console.log('Es wurde eine neue Influxdatenbank eingerichtet');
        }
      });