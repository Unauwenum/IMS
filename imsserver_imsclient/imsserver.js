'use strict';

const express = require('express');
const cors = require('cors');
const axios = require('axios');

// Constants
const PORT = process.env.PORT || 8080;
const HOST = '0.0.0.0';
const BANKSERVER = process.env.BANKSERVER || "localhost";

// App
const app = express();

//Node js muss zugriffe erlauben
/*
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
})*/
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

//Anfrage für Kauf und Verkauf
//Wenn es sich um einen Kauf handelt muss in reqest bei dem Attribut Transaktionsart "Kauf" mitgegeben werden
//Wenn es sich um einen Verkauf handelt gilt selbiges mit "Verkauf"
//Was in den verschiedenen Fällen noch mitgegeben werden muss ist vor den jeweiligen Codabschnitten aufgeschlüsselt
app.post('/transaction', (req, res, next) => {
    if (typeof req.body !== "undefined" && typeof req.body.post_content !== "undefined") {
        var post_content = req.body.post_content;
        var post_content_json = JSON.parse(post_content);
        console.log("Client send 'post_content' with content:", post_content)
        //Aktienkauf
        // 
        if(post_content_json['Transaktionsart'] == "Kauf") {
          axios.post(`http://${BANKSERVER}:8103/Kauf`, {
            post_content: `{"Abbuchung":[{"Kontonummer":${post_content_json['Kontonummer']},"Betrag":${post_content_json['Betrag']}}] }`
            })
            .then(resul => {
              console.log('geht hier rein');
                console.log(`statusCode: ${resul.status}`)
                console.log(resul.data)
                //wenn genug Geld -->
                var bool = true;
                if(bool) {
                  mariadbcon.getConnection().then(conn=>{
                  conn.query(`SELECT DepotID FROM Depot WHERE UserID = ${post_content_json['UserID']}`).then(rows =>  {
                  var DepotID = rows[0].DepotID;
                  var sqlinsertkauf = "INSERT INTO `Kauf` (`KaufID`, `DepotID`, `Symbol`, `Anzahl`, `Kaufpreis`) VALUES (NULL, '"+DepotID+"', '"+post_content_json['Aktie']+"', '"+post_content_json['Anzahl']+"', '"+post_content_json['Betrag']+"') ";
                 
                      //Hat er bereits die Aktie?
                      conn.query(`SELECT * FROM Depotinhalt WHERE DepotID = '${DepotID}'`).then(rows =>{
                        var helpbool = false;
                        for(var i = 0; i < rows.length; i++) {
                          console.log('Inhalt rows'+rows[0]);
                          var helpsymbol = rows[i].Symbol
                          
                          console.log('Diese Aktien hat er bereits'+helpsymbol);
                          if(helpsymbol == post_content_json['Aktie']) {
                            helpbool = true;
                          }
                          }//end for
                          //wenn er die Aktie bereits hat --> Update Depotinhalt, insert Kauf , wenn nicht 2 Inserts
                          if(!helpbool){
                            var sqlinsertdepotinhalt = "INSERT INTO `Depotinhalt` (`DepotID`, `Symbol`, `Anzahl`) VALUES ('"+DepotID+"', '"+post_content_json['Aktie']+"', '"+post_content_json['Anzahl']+"') ";
                            conn.query(sqlinsertkauf).then(rows =>{ console.log('Es wurde ein Kauf in die DB aufgenommen')} )
                            conn.query(sqlinsertdepotinhalt).then(rows => { 
                              console.log('Es wurde der Depotinhalt aktualisiert')
                              res.status(200).json({ message: 'Der Kauf war erfolgreich'});
                            })
                            
                          } else {
                            var sqlupdatedepotinhalt = "UPDATE Depotinhalt SET `Anzahl`=(`Anzahl`+"+post_content_json['Anzahl']+") WHERE `DepotID`="+DepotID+" AND `symbol`='"+post_content_json['Aktie']+"'";
                            console.log(sqlupdatedepotinhalt);
                            conn.query(sqlinsertkauf).then(rows =>{ console.log('Es wurde ein Kauf in die DB aufgenommen')} );
                            conn.query(sqlupdatedepotinhalt).then(rows =>{
                              console.log('Es wurde der Depotinhalt aktualisiert')
                              res.status(200).json({ message: 'Der Kauf war erfolgreich'});
                            });

                          }

                        
                      }) //end depotinhaltselect

                })
              })//end mariadb.con
              }//end if 
            })
            .catch((error) => {
             //   console.error(error)
            })
        }

        //Aktienverkauf
        //Hier werden zunächst die Daten auf der DB von IMS aktuallisieret
        //Wenn das erfolgreich war wird eine Anfrage gegen die Bank API mit einer Gutschrift in Höhe des Betrags gestellt
        //Hier werden die Werte die ab der übernächsten zeile Aufgelistet sind benötigt
        if(post_content_json['Transaktionsart'] == "Verkauf") {
          console.log('geht hier rein');
          var aktie = post_content_json['Aktie'];
          var anzahl = post_content_json['Anzahl'];
          var verkaufspreis = post_content_json['Betrag'];
          var kontonummer = post_content_json['Kontonummer'];
          var depotID = post_content_json['DepotID'];

          mariadbcon.getConnection().then(conn => {
            //depotid aus UserID
          conn.query(`SELECT DepotID FROM Depot WHERE UserID = ${post_content_json['UserID']}`).then(rows =>  {
          var depotID = rows[0].DepotID;
          //Neuer Verkauf wird in DB aufgenommen
          conn.query("INSERT INTO `Verkauf` (`VerkaufID`, `DepotID`, `Symbol`, `Anzahl`, `Verkaufspreis`) VALUES (NULL, '"+depotID+"', '"+aktie+"', '"+anzahl+"', '"+verkaufspreis+"')").then( rows => {
            console.log(rows);

            //Alte Anzahl laden
            var anzahlAlt;
            conn.query("Select Anzahl From Depotinhalt Where Symbol = '"+aktie+"'").then(rows => {
            anzahlAlt = rows[0].Anzahl;

              var anzahlNeu = anzahlAlt - anzahl;
              //wenn anzahlNeu = 0 soll nicht anzahl auf 0 aktualisiert werden, sondern der Datensatz gelöscht
              if(anzahlNeu = 0){
                //Datensatz löschen
               conn.query("Delete From Depotinhalt Where Symbol = '"+aktie+"'").then(rows => {
                console.log(rows);
  
                    console.log('geht hier rein');
                      //Gutschrift auf Konto
                    axios.post(`http://${BANKSERVER}:8103/Verkauf`, {
                    post_content: `{"Gutschreibung":[{"Kontonummer":`+kontonummer+`,"Betrag": `+verkaufspreis+`}] }`
                    })
                    .then((resu) => {
                        console.log(`statusCode: ${resu.status}`)
                        console.log(resu.data)
                        res.status(200).json({ message: resu.data});
                    })
                });
              }
              else{
                //Anzahl der Aktie in Depot wird aktuallisiert 
               conn.query("Update Depotinhalt Set Anzahl = '"+anzahlNeu+"' Where Symbol = '"+aktie+"'").then(rows => {
                console.log(rows);
  
                    console.log('geht hier rein');
                      //Gutschrift auf Konto
                    axios.post(`http://${BANKSERVER}:8103/Verkauf`, {
                    post_content: `{"Gutschreibung":[{"Kontonummer":`+kontonummer+`,"Betrag": `+verkaufspreis+`}] }`
                    })
                    .then((resu) => {
                        console.log(`statusCode: ${resu.status}`)
                        console.log(resu.data)
                        res.status(200).json({ message: resu.data});
                    })
                });
              }
          });
          });
          
         
          })//end Depotid
          })//endcon
        }

        //console.log("Client send 'post_content' with content:", post_content)
        // Set HTTP Status -> 200 is okay -> and send message
        
    }
    else {
        // There is no body and post_contend
        console.error("Client send no 'post_content'")
        //Set HTTP Status -> 400 is client error -> and send message
        res.status(400).json({ message: 'This function requries a body with "post_content"' });
    }
});
//dieser Request wird bei einer Transaktion (Kauf/Verkauf von Aktien) angestoßen
//Er schiickt seinerseits einen Request an den Bankserver ob das notwendige Guthaben vorhanden ist
//ist es vorhanden werden  die Aktien gekauft und der Client bekommt eine Rückmeldung ob die Transkation erfolgreich war
app.post('/post_content', (req,res) => {

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

})


//Abfrage von UserID, Password un DepotID beim Login. Die Vorgehensweise nicht nicht sicher und daher völlig realitätsfremd. Es wird dabei auch nicht
//Verschlüsselt. Es gilt mehr als eine Identifikation mit welchem User gerade gearbeitet werden möchte.
//Benötigt bei einer Anfrage als post_content ein json mit einer Variablen username. (ersten drei Zeilen nach app.post)
//Wenn Abfrage erfolgreich json mit {message:'', UserID: , Password: , DepotID: }
//Wenn Abfrage fehlgeschlagen json mit selben Werten aber nur Message ist entsprechend gefüllt, der Rest ist null
app.post('/login', (req, res) => {
  var post_content = req.body.post_content;
  console.log(post_content);
  console.log('interessant');
  var post_content_json = JSON.parse(post_content);
  console.log('baut verbindung nocht nicht auf');
  mariadbcon.getConnection().then(conn=> {
    console.log('baut verbindung auf');
  conn.query(`Select UserID, Password, Kontonummer From User WHERE Username = '${post_content_json['username']}'`).then( rows => {
    if(rows[0] != null){
      console.log('Anfrage nach UserID und Passwort erfolgreich: ' + rows[0].UserID + ', ' + rows[0].Password);
      conn.query('Select DepotID From Depot Where UserID = ' + rows[0].UserID).then( rowsDepot => {
        if(rowsDepot[0].DepotID != null){
          console.log('Anfrage nach DepotID erfolgreich: ' + rowsDepot[0].DepotID);
          res.status(200).json({message: "Query successful!", UserID: rows[0].UserID, Password: rows[0].Password, DepotID: rowsDepot[0].DepotID, Kontonummer: rows[0].Kontonummer})
        }
        else{
          console.log('Fehler bei Anfrage nach DepotID.');
          res.status(200).json({message: 'The User do not have an Depot! Before logging in this is needed!', UserID: null, Password: null, DepotID: null});
        }
      });
    }
    else{
      console.log('Fehler bei Anfrage nach UserID und Passwort.');
      res.status(200).json({message:'This User could not be found in System!', UserID: null, Password: null, DepotID: null});
    }
  });
});//end mariadbgetConnection
});

//Abfrage aller angebotenen Aktien
//Wenn Abfrage erfolgreich wird json Objekt von Datenbank direkt - ohne umstrukturierung - weiter gegeben
//Wenn Abfrage erfolglos wird json mit message attribut und einem entsprechenden Wert zurückgegeben
app.post('/fetch_stocksymbols', (req, res) => {
  var post_content = req.body.post_content;
  console.log(post_content);
  mariadbcon.getConnection().then(conn=> {
  conn.query('Select * From Sharesymbols').then( rows => {
    if(rows != null){
      console.log('Anfrage nach allen Aktien erfolgreich!');
      res.status(200).json(rows);
    }
    else{
      console.log('Fehler bei Anfrage nach allen Aktien!');
      res.status(200).json({message:'Query not succsessful. Please try again!'});
    }
  });
}); //end get Conn
});
//Funktion übergibt den Depotinhalt mittels der Depotid
app.post('/fetch_depotinhalt', (req, res) => {
  if (typeof req.body !== "undefined" && typeof req.body.post_content !== "undefined") {
    var post_content = req.body.post_content;
          console.log(post_content);
          var post_content_json = JSON.parse(post_content);
          const DepotID = post_content_json['DepotID'];
          mariadbcon.getConnection().then( conn=>{ 
            conn.query("Select * From Depotinhalt Where DepotID='"+DepotID+"'").then(rows=>{
              console.log(rows[0]);
              res.status(200).json(rows);
              
            })
          })





  }else {
      // There is no body and post_contend
      console.error("Client send no 'post_content'")
      //Set HTTP Status -> 400 is client error -> and send message
      res.status(400).json({ message: 'This function requries a body with "post_content"' });
  }
})

app.post('/fetch_data', (req, res) => {
  if (typeof req.body !== "undefined" && typeof req.body.post_content !== "undefined") {
          var post_content = req.body.post_content;
          console.log(post_content);
          var post_content_json = JSON.parse(post_content);
          var symbol = post_content_json['symbol'];
          var time = post_content_json['time'];
            if(time == 'Daily' ) {
              //if samstag/sonntag/montag > 9:35
               influxdb.query(`select * from DailyShares Where symbol = '${symbol}'`)
               .then( result => res.status(200).json(result) )
               .catch( error => res.status(500).json({error}));
            }
            if(time == 'Realtime') {
              
               influxdb.query(`select * from RealtimeShares Where symbol = '${symbol}'`)
               .then( result => res.status(200).json(result) )
               .catch( error => res.status(500).json({error}));
            }
            if(time == 'change') {
              let changevalues = {
                change: "",
                wert: "",
              }
              var dataobj = new Date();
              dataobj.setHours(0);
              dataobj = dataobj.toISOString();
              
                influxdb.query(`select * from RealtimeShares Where symbol = '${symbol}' AND time >= '${dataobj}'`)
                .then(result=> {
                 
                  //wenn result leer wird wert aus den letzen beiden Dailyshares berechnet, wenn er nicht leer ist wird wert aus aktuellem und vortageswert berechnet
                  if(result[0] != undefined) {
                   // console.log(result[0]);
                  //  console.log(result[1]);
                    var open1 = result[result.length-1].open;
                    //vortageswert wird abgefragt
                    influxdb.query(`select * from DailyShares Where symbol = '${symbol}' AND time >= '${dataobj}' - 4d`)
                    .then(result => {
                      var close2 = result[result.length-1].close;
                      changevalues.wert = open1;
                      changevalues.change = (open1/close2)-1
                      
                      res.status(200).json(changevalues)
                     
                    })
                  } else {
                    influxdb.query(`select * from DailyShares Where symbol = '${symbol}' AND time >= now() - 7d`)
                    .then(result => {
                      
                      var close1 = result[result.length-1].close;
                      var close2 = result[result.length-2].close;
                      changevalues.change = (close1/close2)-1;
                      changevalues.wert = close1;
                      //ergebnis an den Client
                      res.status(200).json(changevalues)

                    });
                  }
                }).catch( error => res.status(500).json({error}))
              
            }

          
          console.log("Client send 'post_content' with content:", post_content)
          // Set HTTP Status -> 200 is okay -> and send message
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
    var sqlkauf = "CREATE TABLE `imsdb`.`Kauf` ( `KaufID` INT(10) NOT NULL AUTO_INCREMENT , `DepotID` INT(8) NOT NULL , `Symbol` VARCHAR(10) NOT NULL , `Anzahl` INT(10) NOT NULL , `Kaufpreis` DOUBLE(30,5) NOT NULL , PRIMARY KEY (`KaufID`) ) ENGINE = InnoDB; ";//UNIQUE (`DepotID`, `Symbol`)
    var sqlverkauf = "CREATE TABLE `imsdb`.`Verkauf` ( `VerkaufID` INT(10) NOT NULL AUTO_INCREMENT , `DepotID` INT(8) NOT NULL , `Symbol` VARCHAR(10) NOT NULL , `Anzahl` INT(10) NOT NULL , `Verkaufspreis` DOUBLE(30,5) NOT NULL , PRIMARY KEY (`VerkaufID`) ) ENGINE = InnoDB; "//UNIQUE (`DepotID`, `Symbol`)


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
