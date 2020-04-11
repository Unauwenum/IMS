'use strict';

const express = require('express');
const cors = require('cors');

// Constants
const PORT = process.env.PORT || 8080;
const HOST = '0.0.0.0';

// App
const app = express();

//Node js muss zugriffe erlauben
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
})
app.use(cors());

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
    //res.redirect('/Stock');
    res.redirect('http://localhost:3000/');
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

app.post('/fetch_data', (req, res) => {
  if (typeof req.body !== "undefined" && typeof req.body.post_content !== "undefined") {
          var post_content = req.body.post_content;
          var post_content_json = parse.JSON(post_content);
          var symbol = post_content_json['Information']['symbol'];
          var time = post_content_json['Information']['time'];
          async function asyncDBCall() {
            if(time == 'Daily') {
              influxdb.query(`select * from DailyShares Where symbol = ${symbol}`)
            }

          }
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
})

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
    console.log("Connected!"); 

    var sqluser = "CREATE TABLE `imsdb`.`User` ( `UserID` INT(8) NOT NULL AUTO_INCREMENT , `Username` VARCHAR(30) NOT NULL , `Password` VARCHAR(30) NOT NULL , `Kontonummer` INT(10) NOT NULL , PRIMARY KEY (`UserID`)) ENGINE = InnoDB; ";
    var sqldepot = "CREATE TABLE `imsdb`.`Depot` ( `UserID` INT(8) NOT NULL , `DepotID` INT(8) NOT NULL AUTO_INCREMENT , PRIMARY KEY (`DepotID`), UNIQUE (`UserID`)) ENGINE = InnoDB; "
    var sqldepotinhalt = "CREATE TABLE `imsdb`.`Depotinhalt` ( `DepotID` INT(8) NOT NULL , `Symbol` VARCHAR(10) NOT NULL , `Anzahl` INT(10) NOT NULL , PRIMARY KEY (`DepotID`, `Symbol`)) ENGINE = InnoDB; ";
    var sqlkauf = "CREATE TABLE `imsdb`.`Kauf` ( `KaufID` INT(10) NOT NULL AUTO_INCREMENT , `DepotID` INT(8) NOT NULL , `Symbol` VARCHAR(10) NOT NULL , `Anzahl` INT(10) NOT NULL , `Kaufpreis` DOUBLE(30,5) NOT NULL , PRIMARY KEY (`KaufID`) , UNIQUE (`DepotID`, `Symbol`)) ENGINE = InnoDB; ";
    var sqlverkauf = "CREATE TABLE `imsdb`.`Verkauf` ( `VerkaufID` INT(10) NOT NULL AUTO_INCREMENT , `DepotID` INT(8) NOT NULL , `Symbol` VARCHAR(10) NOT NULL , `Anzahl` INT(10) NOT NULL , `Verkaufspreis` DOUBLE(30,5) NOT NULL , PRIMARY KEY (`VerkaufID`) , UNIQUE (`DepotID`, `Symbol`)) ENGINE = InnoDB; "


    var sqldepotfs = "ALTER TABLE `Depot` ADD CONSTRAINT `UserID` FOREIGN KEY (`UserID`) REFERENCES `User`(`UserID`) ON DELETE RESTRICT ON UPDATE RESTRICT; ";
    var sqldepotinhaltfs = "ALTER TABLE `Depotinhalt` ADD CONSTRAINT `DepotID` FOREIGN KEY (`DepotID`) REFERENCES `Depot`(`DepotID`) ON DELETE RESTRICT ON UPDATE RESTRICT; ";
    var sqlkauffs = "ALTER TABLE `Kauf` ADD CONSTRAINT `DepotIDkauf` FOREIGN KEY (`DepotID`) REFERENCES `Depot`(`DepotID`) ON DELETE RESTRICT ON UPDATE RESTRICT; ";
    var sqlverkauffs = "ALTER TABLE `Verkauf` ADD CONSTRAINT `DepotIDverkauf` FOREIGN KEY (`DepotID`) REFERENCES `Depot`(`DepotID`) ON DELETE RESTRICT ON UPDATE RESTRICT;  ";
    var sqldepotinhaltfs2 = "ALTER TABLE `Depotinhalt` ADD CONSTRAINT `Symbol` FOREIGN KEY (`Symbol`) REFERENCES `Sharesymbols`(`symbol`) ON DELETE RESTRICT ON UPDATE RESTRICT;";
    var sqlkauffs2 = "ALTER TABLE `Kauf` ADD CONSTRAINT `Symbolkauf` FOREIGN KEY (`Symbol`) REFERENCES `Sharesymbols`(`symbol`) ON DELETE RESTRICT ON UPDATE RESTRICT;";
    var sqlverkauffs2 = "ALTER TABLE `Verkauf` ADD CONSTRAINT `Symbolverkauf` FOREIGN KEY (`Symbol`) REFERENCES `Sharesymbols`(`symbol`) ON DELETE RESTRICT ON UPDATE RESTRICT;";
    
    var sqlinsertuser = "INSERT INTO `User` (`UserID`, `Username`, `Password`, `Kontonummer`) VALUES (NULL, 'testuser1', 'securepassword', '1111'), (NULL, 'testuser2', 'securepassword', '2222') ";
    var sqlinsertdepot = "INSERT INTO `Depot` (`UserID`, `DepotID`) VALUES ('1', NULL), ('2', NULL) ";
    var sqlinsertdepotinhalt = "INSERT INTO `Depotinhalt` (`DepotID`, `Symbol`, `Anzahl`) VALUES ('1', 'IBM', '10'), ('2', 'SAP', '12') ";
    var sqlinsertkauf = "INSERT INTO `Kauf` (`KaufID`, `DepotID`, `Symbol`, `Anzahl`, `Kaufpreis`) VALUES (NULL, '1', 'IBM', '12', '1464'), (NULL, '2', 'SAP', '16', '1936') ";
    var sqlinsertverkauf = "INSERT INTO `Verkauf` (`VerkaufID`, `DepotID`, `Symbol`, `Anzahl`, `Verkaufspreis`) VALUES (NULL, '1', 'IBM', '2', '250'), (NULL, '2', 'SAP', '4', '600') ";

    conn.query("SHOW TABLES").then(rows =>  {
        //boolean tabelle vorhanden?
        var booluser = false;
        var booldepot = false;
        var booldepotinhalt = false;
        var boolkauf = false;
        var boolverkauf = false;
    
        for (var i = 0; i < rows.length; i++) {
          var helpstr = rows[i].Tables_in_imsdb
          if (helpstr == 'User') {
            booluser = true;
            
          }
          if (helpstr == 'Depot') {
            booldepot = true;
            
          }
          if (helpstr == 'Depotinhalt') {
            booldepotinhalt = true;
            
          }
          if (helpstr == 'Kauf') {
            boolkauf = true;
            
          }if (helpstr == 'Verkauf') {
            boolverkauf = true;
            
        }
        }//endfor
        if(booluser == false) {
             conn.query(sqluser).then(rows => {
              
              console.log("Table User created");
              conn.query(sqlinsertuser).then(rows => {
                console.log("Testdaten für User eingefügt")
              })
              
            });
           
          }//endif 
        if(booldepot == false) {
            conn.query(sqldepot).then(rows => {
             
             console.log("Table Depot created");
             conn.query(sqldepotfs).then(rows => {
                 console.log("FS für Depot eingerichtet")
                 conn.query(sqlinsertdepot).then(rows => {
                  console.log("Testdaten für Depot eingefügt")
                })
             })
           });
          
          }//endif 
        if(booldepotinhalt == false) {
            conn.query(sqldepotinhalt).then(rows => {
             
             console.log("Table Depotinhalt created");
             conn.query(sqldepotinhaltfs).then(rows => {
                console.log("FS für Depotinhalt eingerichtet")
                
            })
             conn.query(sqldepotinhaltfs2).then(rows => {
                console.log("FS für Depotinhalt eingerichtet")
                conn.query(sqlinsertdepotinhalt).then(rows => {
                  console.log("Testdaten für Depotinhalt eingefügt")
                })
            })
           });
          
         }//endif vvvvv    
        if(boolkauf == false) {
            conn.query(sqlkauf).then(rows => {
             
             console.log("Table Kauf created");
             conn.query(sqlkauffs).then(rows => {
                console.log("FS für Kauf eingerichtet")
            })
             conn.query(sqlkauffs2).then(rows => {
                console.log("FS für Kauf eingerichtet")
                conn.query(sqlinsertkauf).then(rows => {
                  console.log("Testdaten für Kauf eingefügt")
                })
            })
           });
          
         }//endif 
        if(boolverkauf == false) {
            conn.query(sqlverkauf).then(rows => {
             
             console.log("Table Verkauf created");
             conn.query(sqlverkauffs).then(rows => {
                console.log("FS für Verkauf eingerichtet")
            })
             conn.query(sqlverkauffs2).then(rows => {
                console.log("FS für Verkauf eingerichtet")
                conn.query(sqlinsertverkauf).then(rows => {
                  console.log("Testdaten für Verkauf eingefügt")
                })
            })
           });
          
         }//endif 

        


        


});
}); //end con
influxdb.getDatabaseNames().then(function(value) {
    console.log('Connected Influx')
    //wenn das erste mal gestartet muss Datenbank eingerichtet werden
    if(!value.includes('aktiendb')) {
        influxdb.createDatabase('aktiendb');
        console.log('Es wurde eine neue Influxdatenbank eingerichtet');
        }
      })



/*
var sqltestuser = 
var sqltestdepot =
var sqltestkauf =
var sqlverkauf = */
