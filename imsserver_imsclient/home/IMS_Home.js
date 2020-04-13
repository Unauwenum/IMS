'use strict';

function loadStockOverview(){

    
}

function loadDynamicContent(){




    //Alle kaufbaren Aktien laden
    //Verbindung mit MariaDB wird hergestellt

    const pool = mariadb.createPool({
        host: "mysql-development",
        user: "secureuser",
        password: "securepassword",
        port: 3306,
        database: "imsdb"
    });
    pool.getConnection()
        .then(conn => {
        
            conn.query("SELECT * FROM Sharesymbols")
                .then(rows => { // rows: [ {val: 1}, meta: ... ]
                    console.log(rows);
                })
                .then(res => { // res: { affectedRows: 1, insertId: 1, warningStatus: 0 }
                conn.release(); // release to pool
                })
                .catch(err => {
                    conn.release(); // release to pool
                })
                
        }).catch(err => {
            console.log("Connection to " + pool.database + "failed!")
        });

    // Akt. Veränderung für Aktie abfragen
    // axios.post(`http://${SERVER}:8080/fetch_data`, {
    //     post_content: `{"symbol": "${symbol}", "time": "change"}`
    // })
    //     .then((res) => {
    //         // This is executed if the server returns an answer:
    //         // Status code represents: https://de.wikipedia.org/wiki/HTTP-Statuscode
    //         console.log(`statusCode: ${res.status}`)
    //         // Print out actual data:
    //         console.log(res.data);
    //         console.log(res.data.wert);
    //     })
    //     .catch((error) => {
    //         // This is executed if there is an error:
    //         console.error(error)
    //     })
    
    // Inhalte für Tabelle Aktienuebersicht User laden/einfügen
    var new_tr = document.createElement("tr");
    var new_td = document.createElement("td");
    new_td.innerHTML = "IBM";
    new_tr.appendChild(new_td);
    var new_td = document.createElement("td");
    new_td.innerHTML = "5";
    new_tr.appendChild(new_td);
    var new_td = document.createElement("td");
    new_td.innerHTML = "530€";
    new_tr.appendChild(new_td);
    var new_td = document.createElement("td");
    new_td.innerHTML = "+0,34%";
    new_tr.appendChild(new_td);
    var new_td = document.createElement("td");
    var verkaufenBTN = document.createElement("button");
    verkaufenBTN.innerHTML = "Verkaufen";
    verkaufenBTN.name = "IBM";
    verkaufenBTN.setAttribute("onClick", "");
    new_td.appendChild(verkaufenBTN);
    new_tr.appendChild(new_td);

    var table = document.getElementById("tblAktienUebersichtHome");
    table.appendChild(new_tr);


    // Inhalte für Tabelle Kurse Uebersicht laden/einfügen
    for(var i=0; i<30; i++){
        var new_tr = document.createElement("tr");
        var new_td = document.createElement("td");
        new_td.innerHTML = "IBM";
        new_tr.appendChild(new_td);
        var new_td = document.createElement("td");
        new_td.innerHTML = "5";
        new_tr.appendChild(new_td);
        var new_td = document.createElement("td");
        new_td.innerHTML = "530€";
        new_tr.appendChild(new_td);
        var new_td = document.createElement("td");
        var kaufenBTN = document.createElement("button");
        kaufenBTN.innerHTML = "K";
        kaufenBTN.name = "IBM";
        kaufenBTN.setAttribute("onClick", "window.location = 'http://localhost:8080/s'");
        new_td.appendChild(kaufenBTN);
        new_tr.appendChild(new_td);

        var table = document.getElementById("tblKurse");
        table.appendChild(new_tr);
    }

    alert("Hier muss noch was vernünftiges Programmiert werden so das die Tabellen mit echten Daten gefüllt werden!");
}