'use strict';

function loadDynamicContent(){

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
    var verkaufenBTN = document.createElement("input");
    verkaufenBTN.type = "button";
    verkaufenBTN.value = "Verkaufen";
    verkaufenBTN.name = "IBM";
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
        var kaufenBTN = document.createElement("input");
        kaufenBTN.type = "button";
        kaufenBTN.value = "K";
        kaufenBTN.name = "IBM";
        new_td.appendChild(kaufenBTN);
        new_tr.appendChild(new_td);

        var table = document.getElementById("tblKurse");
        table.appendChild(new_tr);
    }
}