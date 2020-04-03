'use strict';

const express = require('express');

// Constants
const PORT = 8090;
const HOST = '0.0.0.0';

// App
const app = express();
app.get('/', (req, res) => {
  res.send('Hello World');
});
//angeforderter KEY von alphavantage
const API_KEY = 'YYSZHT05ZPW27W0X';
var share_symbol = 'IBM';
//alphavantage Schnittstelle
let API_CALL = 'https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=IBM&apikey=demo';
var err;

//XML HTTP Request ist standardmäßig nicht vorhanden deswegen -->
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

//influxdb einbinden
const InfluxDB = require('influx');
const influxdb = new InfluxDB.InfluxDB({
  host  : "localhost",
 // "port"  : "8086",
//  database : "aktiendb"
})


influxdb.getDatabaseNames().then(function(value) {
  console.log(value[0]);
  //wenn das erste mal gestartet muss Datenbank eingerichtet werden
  if(!value.includes('aktiendb')) {
    influxdb.createDatabase('aktiendb');
    console.log('Es wurde eine neue Influxdatenbank eingerichtet');
  }
});



//Instanz eines XMLHttpRequest wird erzeugt, der den Inhalt der in der Variablen angegebenen Datei liest
function loadJSON(file,callback) {   
  var xobj = new XMLHttpRequest();
  xobj.open('GET', file, true); 
  xobj.onreadystatechange = function () {
    if (xobj.readyState == 4 && xobj.status == '200') {
    // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
      callback(xobj.responseText);
     }
  };
  xobj.send(null); 
  
}



app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);

//Einspeisung Daten letzte hundert 
var timezone = '';
var symbol = '';
var timestamp = '';
var open = '';
var high = '' ;
var low = '';
var close = '';
var volume = '';
//Tagesdatum in das gelieferte JSON FORMAT konvertieren
var dataobj = new Date();
dataobj = dataobj.toISOString();
    dataobj = dataobj.substr(0,10);
    console.log(dataobj);

var influxline = 'LastHundredShares, timezone='+timezone+',symbol='+symbol+',open='+open+',high='+high+',low='+low+',close='+close+',volume='+volume;
//laden eines JSON-> enthält Werte der letzten hundert Tage im JSON Format
loadJSON(API_CALL, function(text){
  
  var data = JSON.parse(text);
  console.log('hier kommt nach parsen')
  console.log(data['Meta Data']['2. Symbol']);
  for(var i=0; i <= 0 ; i++) {
  
    timezone = data['Meta Data']['6. Time Zone'];
    symbol = data['Meta Data']['2. Symbol'];
    console.log(data['Time Series (Daily)']['2020-04-01']['1. open']);
    
    


  }
  
  
});

