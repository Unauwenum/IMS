// ** setTimeout(function () {


'use strict';

const express = require('express');

// Constants
const PORT = 8103;
const HOST = '0.0.0.0';

var mysql = require('mysql')

// ** als container: host: "banksqldb"
// ** als normalerserver: localhost
var verbindung = mysql.createConnection({
  host: "localhost",
  user: "secureuser",
  password: "securepassword",
  database: "bankdb"
});

console.log("vor Connect");

verbindung.connect(function (err) {
  if (err) throw err;
  console.log("connected!");
  /*
  verbindung.query(" SELECT * FROM Konto", function (err, result, fields) {
    if (err) throw err;
    console.log(result);
  });
*/

});
// -----neuer code
//wenn Tabelle nicht vorhanden, erstellen
verbindung.query("SHOW TABLES", function (err, result) {
  if (err) throw err;
  console.log("---TEST nach show tables --");
  //boolean Tabelle vorhanden?
  var boolkonto = false;
  var boolkunde = false;
  var sql = ""
  console.log(result);
  console.log("---- NACH Log RESULT ---");

  for (var i = 0; i < result.length; i++) {
    var helpstr = result[i].Tables_in_bankdb
    console.log(helpstr)
    if (helpstr == 'Kunde') {
      boolkunde = true;
    }
    if (helpstr == 'Konto') {
      boolkonto = true;
    }
  }


  if (boolkunde == false) {
    sql = "CREATE TABLE Kunde (Kdnr INTEGER (4) NOT NULL, Name VARCHAR(20) NOT NULL, Passwort VARCHAR(8) NOT NULL, PRIMARY KEY (Kdnr))ENGINE=InnoDB;";
    verbindung.query(sql, function (err, result) {
      if (err) throw err;
      console.log("Table Kunde created");
      sql = "INSERT into Kunde (Kdnr,Name, Passwort) VALUES (111, 'Achim Alt', 111), (222, 'Berta Brot', 222)";
      verbindung.query(sql, function (err, result) {
        if (err) throw err;
        console.log("Insert Kunde erledigt");
      });
    });
  }

  if (boolkonto == false) {
    console.log("---in if CREATE KONTO---");
    sql = " CREATE TABLE Konto (Knr INTEGER(6) NOT NULL, Kontostand FLOAT NOT NULL, ID INTEGER (4) NOT NULL, PRIMARY KEY (Knr), FOREIGN KEY (ID) REFERENCES Kunde(Kdnr)) ENGINE = InnoDB;";
    verbindung.query(sql, function (err, result) {
      if (err) throw err;
      console.log("Table Konto created");
      sql = "INSERT into Konto (Knr, Kontostand, ID) VALUES (111, 2000.99, 111), (222, 5000, 222)";
      verbindung.query(sql, function (err, result) {
        if (err) throw err;
        console.log("Insert Konto erledigt");
      })
    });
  }
}
);

console.log("---vor select konto ---");
setTimeout(function () {
  verbindung.query(" SELECT * FROM Konto", function (err, result, fields) {
    if (err) throw err;
    console.log(result);
  });
}, 3000);

setTimeout(function () {
  verbindung.query(" SELECT * FROM Kunde", function (err, result, fields) {
    if (err) throw err;
    console.log(result);

  });
}, 3000);


//verbindung.query(" SELECT * FROM "+var+" )

// App
const app = express();
// **** Kauf****
app.get('/Kauf', (req, res) => {

  var obj = JSON.parse('{"Abbuchung":[{"Kontonummer":222,"Betrag":170}]}');

  console.log("*** Abbuchungsbetrag: " + obj.Abbuchung[0].Betrag);
  verbindung.query(" SELECT Kontostand FROM Konto WHERE Knr = " + obj.Abbuchung[0].Kontonummer, function (err, result, fields) {
    if (err) throw err;
    console.log("Kontostand: " + result[0].Kontostand);


    if (obj.Abbuchung[0].Betrag < result[0].Kontostand) {
      verbindung.query("UPDATE Konto SET Kontostand=Kontostand-" + obj.Abbuchung[0].Betrag + " WHERE Knr = " + obj.Abbuchung[0].Kontonummer, function (err, result, fields) {
        if (err) throw err;
      });


      verbindung.query(" SELECT Kontostand FROM Konto WHERE Knr =" + obj.Abbuchung[0].Kontonummer, function (err, result, fields) {
        if (err) throw err;
        console.log("Kontostand nach Abbuchung: " + result[0].Kontostand);
      });
      res.send('Hallo ich bin der bankserver der Kontostand beträgt' + result[0].Kontostand);
    } else {
      verbindung.query(" SELECT Kontostand FROM Konto WHERE Knr = " + obj.Abbuchung[0].Kontonummer, function (err, result, fields) {
        if (err) throw err;
        res.send('zu wenig Geld, nur noch ' + result[0].Kontostand + ' Euro übrig');
      }
      )
    };
  });
});

app.get('/T', (req, res) => {
  var obj = JSON.parse(req.query.Betrag + req.query.Kontonummer);
  //var obj = JSON.parse('{"Abbuchung":[{"Kontonummer":111,"Betrag":170}]}');
  console.log("Test");
  res.send("Betrag " + req.query.Betrag + " Kontonummer " + req.query.Kontonummer)
});


// **** Verkauf****
app.get('/Verkauf', (req, res) => {

  var obj = JSON.parse('{"Abbuchung":[{"Kontonummer":111,"Betrag":170}]}');

  console.log("*** Zubuchungsbetrag: " + obj.Abbuchung[0].Betrag);
  verbindung.query(" SELECT Kontostand FROM Konto WHERE Knr = " + obj.Abbuchung[0].Kontonummer, function (err, result, fields) {
    if (err) throw err;
    console.log("Kontostand: " + result[0].Kontostand);


    verbindung.query("UPDATE Konto SET Kontostand=Kontostand+" + obj.Abbuchung[0].Betrag + " WHERE Knr = " + obj.Abbuchung[0].Kontonummer, function (err, result, fields) {
      if (err) throw err;
    });


    verbindung.query(" SELECT Kontostand FROM Konto WHERE Knr =" + obj.Abbuchung[0].Kontonummer, function (err, result, fields) {
      if (err) throw err;
      console.log("Kontostand nach Zubuchung: " + result[0].Kontostand);
    });

    /*var stand = kontostand(111);

    setTimeout(function () {
      console.log("Stand " + stand);
    }, 6000);*/

    res.send('Hallo ich bin der bankserver der Kontostand beträgt vor Zubuchung ' + result[0].Kontostand);
  });
});

    //var Stand = kontostd(111);

    /*function kontostand(Kontonummer) {
      setTimeout(function () {
        verbindung.query(" SELECT Kontostand FROM Konto WHERE Knr =" + Kontonummer, function (err, result, fields) {
          console.log("in funk: " + result[0].Kontostand);
          if (err) throw err;
          var erg = result[0].Kontostand;
          console.log("ergebnis " + erg);
          return 4;
        })
      },3000);
    };*/


app.listen(PORT, HOST)
console.log(`Running on http://${HOST}:${PORT}`);


// **  }, 20000)





/*
var obj =  JSON.parse('{"Abbuchung":[{"Kontonummer":222,"Betrag":2000}]}');
console.log("***"+obj.Abbuchung[0].Betrag);
verbindung.query(" SELECT Kontostand FROM Konto WHERE Knr =" +obj.Abbuchung[0].Kontonummer, function (err, result, fields) {
  if (err) throw err;
  console.log(result);
});*/

//console.log(JSON.parse(req).Abbuchung[0].);
//für Kauf
// req = "{ Abbuchung { :Kontonummer : 111
//                      :Betrag : 2000}"
// var object = req.JSON.parse()
// var Betrag = object['Abbuchung']['Betrag']
// var Kontonumme = oject['Abbuchung']['Kontonummer'];

// String = "{ Statuscode }"