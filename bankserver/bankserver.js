 setTimeout(function () {


'use strict';

const express = require('express');
const cors = require('cors');

// Constants
const PORT = 8103;
const HOST = '0.0.0.0';

var mysql = require('mysql')

// ** als container: host: "banksqldb"
// ** als normalerserver: localhost
var verbindung = mysql.createConnection({
  host: "banksqldb",
  user: "secureuser",
  password: "securepassword",
  database: "bankdb"
});

console.log("vor Connect");

verbindung.connect(function (err) {
  if (err) throw err;
  console.log("connected!");
 

});

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
      sql = "INSERT into Konto (Knr, Kontostand, ID) VALUES (1111, 2000.99, 111), (2222, 5000, 222)";
      verbindung.query(sql, function (err, result) {
        if (err) throw err;
        console.log("Insert Konto erledigt");
      })
    });
  }
}
);

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


// App
const app = express();
app.use(cors());
// Features for JSON Body
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// **** Kauf****
app.post('/Kauf', (req, res) => {
  console.log('Request'+req);
  console.log('Request body'+req.body);
  console.log(req.body.post_content);
  var post_content = req.body.post_content;
  var obj = JSON.parse(post_content);
  //var obj = JSON.parse('{"Abbuchung":[{"Kontonummer":1111,"Betrag":170}]}');
  console.log("*** Abbuchungsbetrag: " + obj.Abbuchung[0].Betrag);
  verbindung.query(" SELECT Kontostand FROM Konto WHERE Knr =  '"+obj.Abbuchung[0].Kontonummer+"'", function (err, result, fields) {
    if (err) throw err;
    console.log(result);
    console.log("Kontostand vor Abbuchung: " + result[0].Kontostand);

    if (obj.Abbuchung[0].Betrag < result[0].Kontostand) {
      verbindung.query("UPDATE Konto SET Kontostand=Kontostand-" + obj.Abbuchung[0].Betrag + " WHERE Knr = " + obj.Abbuchung[0].Kontonummer, function (err, result, fields) {
        if (err) throw err;
      });

      verbindung.query(" SELECT Kontostand FROM Konto WHERE Knr =" + obj.Abbuchung[0].Kontonummer, function (err, result, fields) {
        if (err) throw err;
        console.log("Kontostand nach Abbuchung: " + result[0].Kontostand);
      
      res.send('Der Kontostand nach der Abbuchung beträgt ' + result[0].Kontostand +' Dollar');
    });
    } else {
      verbindung.query(" SELECT Kontostand FROM Konto WHERE Knr = " + obj.Abbuchung[0].Kontonummer, function (err, result, fields) {
        if (err) throw err;
        res.send('Fehler. Der Kontostand ist zu niedrig. Nur noch ' + result[0].Kontostand + ' Dollar übrig');
      }
      )
    };
  });
});
//Test mit in URL mitgeben
/*app.get('/T', (req, res) => {
  var obj = JSON.parse(req.query.Betrag + req.query.Kontonummer);
  //var obj = JSON.parse('{"Abbuchung":[{"Kontonummer":111,"Betrag":170}]}');
  console.log("Test");
  res.send("Betrag " + req.query.Betrag + " Kontonummer " + req.query.Kontonummer)
});*/


// **** Verkauf****
app.post('/Verkauf', (req, res) => {

  //var obj = JSON.parse('{"Gutschreibung":[{"Kontonummer":111,"Betrag":170}]}');
  console.log(req.body.post_content);
  var post_content = req.body.post_content;
  var obj = JSON.parse(post_content);
  console.log("Zubuchungsbetrag: " + obj.Gutschreibung[0].Betrag);
  verbindung.query(" SELECT Kontostand FROM Konto WHERE Knr = " + obj.Gutschreibung[0].Kontonummer, function (err, result, fields) {
    if (err) throw err;
    console.log("Kontostand vor Zubuchung: " + result[0].Kontostand);

    verbindung.query("UPDATE Konto SET Kontostand=Kontostand+" + obj.Gutschreibung[0].Betrag + " WHERE Knr = " + obj.Gutschreibung[0].Kontonummer, function (err, result, fields) {
      if (err) throw err;
    });

    verbindung.query(" SELECT Kontostand FROM Konto WHERE Knr =" + obj.Gutschreibung[0].Kontonummer, function (err, result, fields) {
      if (err) throw err;
      console.log("Erledigt. Der Kontostand nach der Zubuchung beträgt " + result[0].Kontostand +" Dollar");
    
    res.send('Erledigt. Der Kontostand nach der Gutschreibung beträgt ' + result[0].Kontostand+ 'Dollar');
  });
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


 }, 20000)





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

//Versuch in Funktion auszulagern
/*function kontostand(Kontonummer) {
  setTimeout(function () {
    verbindung.query(" SELECT Kontostand FROM Konto WHERE Knr =" + Kontonummer, function (err, result, fields) {
      console.log("in funk: " + result[0].Kontostand);
      if (err) throw err;
      var erg = result[0].Kontostand;
      console.log("ergebnis " + erg);
      return erg;
    })
  },3000);
};*/