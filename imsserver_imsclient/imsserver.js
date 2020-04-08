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
    console.log("Got a request and serving 'Hello World'");
    res.send('<!DOCTYPE html> <html lang="en"> <head> <meta charset="utf-8"> <meta http-equiv="X-UA-Compatible" content="IE=edge"> <meta name="viewport" content="width=device-width, initial-scale=1"> <title>ISM</title> <script type="text/javascript" src="IMS_Home.js"></script> <link href="index.css" rel="stylesheet"> </head> <body onload="loadDynamicContent()"> <div id="header"> <p class="headerElements">Depowert:</p> <p class="headerElements" id="pDepowertHeader">--</p> <p class="headerElements">Bargeld:</p> <p class="headerElements" id="pBargeldHeader">--</p> <p class="headerElements" >Veränderung (letzten 24h):</p> <p class="headerElements" id="pVeränderungHeader">--</p> <p class="headerElements" >Angemeldet als:</p> <p class="headerElements" id="pAngemeldetHeader">--</p> <input type="button" class="headerElements" id="btnAnmelden" value="Anmelden"> </div> <div id="middle"> <div id="uebersicht"> <h3>Aktuelle Kurse:</h3> <table id="tblKurse" class="tblKurse"> <tr> <th>Aktie</th> <th>Preis</th> <th>Veränderung</th> <th></th> </tr> <!-- Hier wird dynamisch Inhalt eingefügt --> </table> </div> <div id="main"> <h3>Deine Aktien:</h3> <table id="tblAktienUebersichtHome" class="tblAktienUebersicht"> <tr> <th>Aktie</th> <th>Anzahl</th> <th>Wert</th> <th>Veränderung</th> <th></th> </tr> <!-- Hier wird dynamisch Inhalt eingefügt --> </table> </div> </div> </body> </html>');
});

// Another GET Path - call it with: http://localhost:8080/special_path
app.get('/special_path', (req, res) => {
    res.send('This is another path');
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
// call it with: http://localhost:8080/static
app.use('/static', express.static('static'))

// Start the actual server
app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);