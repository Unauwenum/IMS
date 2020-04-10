setTimeout( function () {'use strict';

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
var share_symbol;
//alphavantage Schnittstelle

var err;

//XML HTTP Request ist standardmäßig nicht vorhanden deswegen -->
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

//influxdb einbinden
//wichtig!, die Datenbank startet langsamer als das datadelivery.js man könnte dieses Problem durch ein Skript lösen
//aber das Problem wird in diesem Fall durch einen einfachen Delay gelöst 
function sleep(milliseconds) { //Funktion um Javascript auszusetzen
  const i = Date.now();
  let f = null;
  do {
    f = Date.now();
  } while (f - i < milliseconds);
}

//Verbindung mit Influxdb wird hergestellt
const InfluxDB = require('influx');
const influxdbold = new InfluxDB.InfluxDB({
  host  : "influxdb-development",
  //port  : "8086",
 
})
//Verbindung mit MariaDB wird hergestellt
const mariadb = require('mariadb');
var mariadbcon = mariadb.createPool({
  host: "mysql-development",
  user: "secureuser",
  password: "securepassword",
  port: 3306,
  database: "imsdb"
})
//connection wirdaufgebaut
mariadbcon.getConnection().then(conn =>  {
  console.log("Connected!");
  //wenn die Tabelle noch nicht vorhanden ist, wird sie erstellt
  conn.query("SHOW TABLES").then(rows =>  {
    //boolean tabelle vorhanden?
    var bool = false;

    for (var i = 0; i < rows.length; i++) {
      var helpstr = rows[i].Tables_in_imsdb
      if (helpstr == 'Sharesymbols') {
        bool = true;
        
      }
    }
    if(bool == false) {
      var sql = " CREATE TABLE `imsdb`.`Sharesymbols` ( `symbol` VARCHAR(10) NOT NULL , `share` VARCHAR(30) NOT NULL , PRIMARY KEY (`symbol`)) ENGINE = InnoDB; ";
      conn.query(sql).then(rows => {
        
        console.log("Table created");
      });
      var sql = " INSERT INTO `Sharesymbols` (`symbol`,`share`) VALUES ('IBM', 'IBM'), ('SAP', 'SAP')";
      conn.query(sql).then(rows => {
        if (err) throw err;
        console.log("Inserted values");
      });
    }

  });
 
  
});



influxdbold.getDatabaseNames().then(function(value) {
  //wenn das erste mal gestartet muss Datenbank eingerichtet werden
  if(!value.includes('aktiendb')) {
    influxdb.createDatabase('aktiendb');
    console.log('Es wurde eine neue Influxdatenbank eingerichtet');
  }
});

const influxdb = new InfluxDB.InfluxDB({
  host  : "influxdb-development",
  //port  : "8086",
 database : "aktiendb"
})



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
var open = '';
var high = '' ;
var low = '';
var close = '';
var volume = '';
//Tagesdatum in das gelieferte JSON FORMAT konvertieren
const today = new Date(); //Tagesdatum
//unixtime variablen, wichtig für das Einfügen in die Influxdb
const unixtimezero = Date.parse('01 Jan 1970 00:00:00 GMT');
//folgende objekte werden benötigt um später einen Punkt in die influxdb einzufügen
var timestamp = '';
var tags = {
  timezone: " ",
  symbol: " ",
}
var fields = {
  open: " ",
  high: " ",
  low: " ",
  close: " ",
  volume: " ",
}
var IPoint = {
//  measurement: " ",
  tags: null,
  fields: null,
  timestamp: " ",
}

var IPointobj = new Object();
//IPoint array für massenverarbeitung
var IPointsarray = [];
var iarray = []; //es müssen die i Werte der forSchleife abgespeichert werden, in denen ein IPoint hinzugefügt wurde
var influxline = 'LastHundredShares, timezone='+timezone+',symbol='+symbol+' open='+open+',high='+high+',low='+low+',close='+close+',volume='+volume+' '+timestamp;
//laden eines JSON-> enthält Werte der letzten hundert Tage im JSON Format wird in die influxdb geladen
//die Aktien die geladen werden sollen werden aus der Mysqltabelle geladen


setTimeout(function() {
  mariadbcon.getConnection().then(conn => {
    conn.query("SELECT symbol FROM Sharesymbols").then(rows => {
    for( var i = 0; i < rows.length; i++){
      share_symbol = rows[i].symbol;
    let API_CALL_DAILY = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${share_symbol}&apikey=${API_KEY}`;
    loadJSON(API_CALL_DAILY, function(text){
  
      var data = JSON.parse(text);
      //setzt timezone und tag nachdem ein JSON objekt erstellt wurde
      timezone = data['Meta Data']['5. Time Zone'];
      symbol = data['Meta Data']['2. Symbol'];
      
      //setzen der tags 
      tags = new Object();
      tags.symbol = symbol;
      tags.timezone = timezone;
      var z = 0;
      for(var i=0; i <= 99 ; i++) {
        
        //Datum wird in einer Schleife immer einen Tag zurückgesetzt um die Werte einzufügen
        //Leider ist es so, das Börsenfreie tage existieren, um diesen Ausnahmen zu begegegnen muss ein neuer zähler eingeführt werden
        //um gleichzeitig 100 erfolgreiche Schleifendurchläufe zu gewährleisten aber auch das Datum jeweils 1 tag herunterzusetzen
        //die zusätzliche -1 kommt daher, da die Tageswerte des heutigen tages erst am nächsten tag erscheinen
        var dataobj = new Date(today);
        dataobj.setDate(dataobj.getDate() - z -1);
        //Es sind logischerweise nur Weerte von Montag-Freitag vorhanden -> Überprüfung 
        var tag = dataobj.getDay(); //gibt int zurück, die Werte 0 und 6 entsprechen Sonntag und Samstag
        
        if(tag != 0 && tag != 6) {
          //hier wird Datum in die richtige Form zum abfragen gebracht
          var ISOString = dataobj.toISOString();
          ISOString = ISOString.substr(0,10);
          //etwas unschön aber falls der Wert undefined ist, wird der nächste schleifendurchlauf eingeleitet
          if(data['Time Series (Daily)'][ISOString] == undefined) {
            z++;
            continue;
          }
          open = data['Time Series (Daily)'][ISOString]['1. open'];
          high = data['Time Series (Daily)'][ISOString]['2. high'];
          low = data['Time Series (Daily)'][ISOString]['3. low'];
          close = data['Time Series (Daily)'][ISOString]['4. close'];
          volume = data['Time Series (Daily)'][ISOString]['5. volume'];
          //datum für späteres auslesen auf 0 stunden /minuten/sekunden setzen)
    
          dataobj.setHours(0);
          dataobj.setMinutes(0);
          dataobj.setSeconds(0);
          dataobj.setMilliseconds(0);
          timestamp = dataobj.getTime();
          //console.log(timestamp);
          fields= new Object();
          //setzen der fields
          fields.open = open;
          fields.high = high;
          fields.low = low;
          fields.close = close;
          fields.volume = volume;
    
          //zusammenstellen des IPoint
          //IPoint.measurement = "DailyShares";
          
          IPointobj = new Object();
          IPointobj.tags = tags;
          IPointobj.fields = fields;
          IPointobj.timestamp = timestamp;
          //IPoinbt abspeichern
          console.log(IPointobj.fields.open);
          IPointsarray[i] = IPointobj;
          
          //es müssen die i werte abgespeichert werden, in denen ein Wert hinzugefügt wurde
          iarray[iarray.length] = i;
          z++;
          
          //test
    
    
        } else{
          i = i - 1;
          z++;
    
        }//endiftag 
    
    
      } //end for
    
      //Einfügen in Influxdb
      for (var i = 0; i < iarray.length; i++) {
        var b = iarray[i];
        influxdb.writeMeasurement('DailyShares', [IPointsarray[b]] );
      };
      console.log("Die DailyShares wurden für die Aktie von "+symbol+" aktualisiert");
      
      
    }); //end loadJason


  }
})//end rows

})//end conn

}, 5000);//end setTimoutfunction

//laden der Echtzeitdaten, (1min Intraday intervall)
/*
API_Call ändern in Api_call intraday
*/
setTimeout(function() {
mariadbcon.getConnection().then(conn => {
  conn.query("SELECT symbol FROM Sharesymbols").then(rows => {
  for( var i = 0; i < rows.length; i++){
    share_symbol = rows[i].symbol;
    let API_CALL_INTRADAY = `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${share_symbol}&interval=1min&apikey=${API_KEY}`;

//Wichtig, die Börsen an der die abgefragten Aktien gehandelt werden machen um 9:35 Amerikanischer Zeit auf und schließen 16:00 Amerikanischer Zeit, deswegen überpfügun

      loadJSON(API_CALL_INTRADAY, function(text){
        
        var data = JSON.parse(text);
        //setzt timezone und tag nachdem ein JSON objekt erstellt wurde
        timezone = data['Meta Data']['6. Time Zone'];
        symbol = data['Meta Data']['2. Symbol'];
        
        //setzen der tags 
        tags = new Object();
        tags.symbol = symbol;
        tags.timezone = timezone;
        var z = 0;
        //neuer zähler 
        var y = 0;

        for(var i=0; i <= 99 ; i++) {
          
          //Datum wird in einer Schleife immer einen Tag zurückgesetzt um die Werte einzufügen
          //Leider ist es so, das Börsenfreie tage existieren, um diesen Ausnahmen zu begegegnen muss ein neuer zähler eingeführt werden
          //um gleichzeitig 100 erfolgreiche Schleifendurchläufe zu gewährleisten aber auch das Datum jeweils 1 tag herunterzusetzen
          //die zusätzliche -1 kommt daher, da die Tageswerte des heutigen tages erst am nächsten tag erscheinen
          //andere Zeitzone--> 6Stunden minus
          var dataobj = new Date(today);
          console.log(dataobj);
          dataobj.setHours(dataobj.getHours() - 4);
          dataobj.setMinutes(dataobj.getMinutes() - z  -2);
          
          //angenommen es sind nur 20 Datens-tze vorhanden (von 9:35-9:55) müssen ab diesem Zeitpunkt die Daten vom Vortag geladen werden
          if(dataobj.getHours() > 16 || (dataobj.getMinutes() <= 35 && dataobj.getHours() == 9 || dataobj.getHours() <= 8)) {
            
            //hier wird das Datum vom letzten Refresh herausgezogen
            helpstring = data['Meta Data']['3. Last Refreshed'];
            var dataobj = new Date(helpstring);
            console.log(helpstring);
            console.log('Hier kommt das Datenobjet');
            console.log(dataobj);
            dataobj.setHours(dataobj.getHours() + 2);
            dataobj.setMinutes(dataobj.getMinutes() - y);
            console.log(dataobj);
            y++;
          }
            //hier wird Datum in die richtige Form zum abfragen gebracht
            var ISOString = dataobj.toISOString();
            var helpstring = ISOString.substring(11, 17);
            ISOString = ISOString.substr(0,10);
            ISOString = ISOString+" "+helpstring+"00";
            console.log(ISOString);
            //etwas unschön aber falls der Wert undefined ist, wird der nächste schleifendurchlauf eingeleitet
            if(data['Time Series (1min)'][ISOString] == undefined) {
              z++;
              continue;
            }
            open = data['Time Series (1min)'][ISOString]['1. open'];
            high = data['Time Series (1min)'][ISOString]['2. high'];
            low = data['Time Series (1min)'][ISOString]['3. low'];
            close = data['Time Series (1min)'][ISOString]['4. close'];
            volume = data['Time Series (1min)'][ISOString]['5. volume'];
            //datum für späteres auslesen auf 0 /sekunden setzen)

            dataobj.setSeconds(0);
            dataobj.setMilliseconds(0);
            timestamp = dataobj.getTime();
            //console.log(timestamp);
            fields= new Object();
            //setzen der fields
            fields.open = open;
            fields.high = high;
            fields.low = low;
            fields.close = close;
            fields.volume = volume;

            //zusammenstellen des IPoint
            //IPoint.measurement = "DailyShares";
            
            IPointobj = new Object();
            IPointobj.tags = tags;
            IPointobj.fields = fields;
            IPointobj.timestamp = timestamp;
            //IPoinbt abspeichern
            console.log(IPointobj.fields.open);
            IPointsarray[i] = IPointobj;
            
            //es müssen die i werte abgespeichert werden, in denen ein Wert hinzugefügt wurde
            iarray[iarray.length] = i;
            z++;
            
            //test


        } //end for
        console.log(iarray.length);
        //Einfügen in Influxdb
        for (var i = 0; i < iarray.length; i++) {
          var b = iarray[i];
          influxdb.writeMeasurement('RealtimeShares', [IPointsarray[b]] );
        };
        console.log("Die RealtimeShares wurden für die Aktie von "+symbol+" aktualisiert");
        
        
      }) //end loadJason

 
    }
  })//end rows

})//end conn

}, 5000);//end setTimoutfunction

}, 20000);