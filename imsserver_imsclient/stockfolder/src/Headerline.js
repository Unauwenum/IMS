import React from 'react';
import history from './history';
import mycookie from './Cookie';
import axios from 'axios';
const SERVER = process.env.SERVER || "localhost";
var object;
var tabelleninhalt;
var symbol;
var time = 'change';
var depotwert;

class Headerline extends React.Component {

    constructor() {
        super();
        this.state = {
          depotwert: "-",
          username: "-"
        };
      }
      update(){
        
        this.setState( {  
            username: mycookie.username 
    });
        this.fetchdepotwert();
      }
     
      fetchdepotwert() {
    
        const pointer = this;
            depotwert = 0;
            object = new Object();
            tabelleninhalt = [];
             var wert;
             var veränderung;
            console.log(pointer);
            axios.post(`http://${SERVER}:8080/fetch_depotinhalt`, {
                // definition of actual content that should be sned with post as JSON
                post_content: `{ "DepotID": "${mycookie.depotid}"}`
            })
                .then(res => {
                    // This is executed if the server returns an answer:
                    // Status code represents: https://de.wikipedia.org/wiki/HTTP-Statuscode
                    console.log(`statusCode: ${res.status}`)
                    // Print out actual data:
                    //alles symbole in einem Array
                    console.log('hier kommt das resultat aus der 1. Anfrage')
                    console.log(res.data);
                    for ( var i = 0; i < res.data.length; i++) {
                     
                        object = new Object();
                        object.Aktie = res.data[i].Symbol
                        object.Anzahl = res.data[i].Anzahl
                        tabelleninhalt[i] = object
                        console.log(tabelleninhalt[i].Anzahl);
                        console.log(tabelleninhalt[i].Aktie);
                    }//end for
                    //hier wird für jedes symbol die werte zugewiesen
                   this.fetchdata();
                }) //endthen
                .catch(error => {
                    // This is executed if there is an error:
                    console.error(error)
                })
     
        }//end fetchdepotinhalt
     
         //für jedes Object bzw symbol in tabelleninhalt wwerden wert und veränderung hinzugefügt
        //in diesem Fall werden die Werte mit der Anzahl multipliziert
       async fetchdata () {
          console.log('getht in fetch data rein');
          console.log(tabelleninhalt.length);
         const pointer = this;
       
        for( var i = 0; i < tabelleninhalt.length; i ++){
         
             symbol = tabelleninhalt[i].Aktie;
              var wert;
              var veränderung;
              console.log(tabelleninhalt[i]);
     
             await axios.post(`http://${SERVER}:8080/fetch_data`, {
                 // definition of actual content that should be sned with post as JSON
                 post_content: `{"symbol": "${symbol}", "time": "${time}"}`
             })
                 .then(res => {
                     // This is executed if the server returns an answer:
                     // Status code represents: https://de.wikipedia.org/wiki/HTTP-Statuscode
                     console.log(`statusCode: ${res.status}`)
                     // Print out actual data:
                  
                       var helpnumber2 = res.data.wert;
                       wert = helpnumber2 - 0
                       //wert mal Anzahl ergibt den Gesamtwert
                       console.log('anzahl:'+tabelleninhalt[i].Anzahl);
                       console.log(wert);
                       wert = wert * tabelleninhalt[i].Anzahl
                       console.log(wert);
                       
                       console.log(tabelleninhalt[i]);
                       tabelleninhalt[i].Gesamtwert = wert
                       
                       var helpnumber = res.data.change
                       helpnumber = helpnumber *100;
                       veränderung = helpnumber.toFixed(2);
                       veränderung = veränderung +'%';
                       tabelleninhalt[i].Veränderung = veränderung;
                       
                       
     
                    
                 })
                 .catch(error => {
                     // This is executed if there is an error:
                     console.error(error)
                 })
              }
             for (var i = 0; i < tabelleninhalt.length; i++) {
                depotwert = tabelleninhalt[i].Gesamtwert + depotwert
             }
             depotwert = depotwert /2
             depotwert = depotwert;
             pointer.setState({
                 depotwert: depotwert
                 })
     
       }
     
 
    
    componentDidMount(){
        this.update();
        this.fetchdepotwert();
    }
    render() {
        return(
            <div id="header">
            <p class="headerElements">Depowert:</p>
             <p class="headerElements" id="pDepowertHeader">{this.state.depotwert}</p>
            <p class="headerElements">Angemeldet als:</p>
        <p class="headerElements" id="pAngemeldetHeader">{this.state.username}</p> 
            <input type="button" class="headerElements"  id="btnAbmelden" value="Abmelden" onClick={() => history.push('/')}></input>
                
            </div>
            
           
        )
    }


}

export default Headerline;
/*
class Headerline extends React.Component {
    render() {
        return(
            <div id="header">
            <p class="headerElements">Depowert:</p>
             <p class="headerElements" id="pDepowertHeader">--</p>
            //<p class="headerElements">Bargeld:</p>
            <p class="headerElements" id="pBargeldHeader">--</p>
            <p class="headerElements">Veränderung (letzten 24h):</p>
            <p class="headerElements" id="pVeränderungHeader">--</p>
            <p class="headerElements">Angemeldet als:</p>
            <p class="headerElements" id="pAngemeldetHeader">--</p> 
            <input type="button" class="headerElements"  id="btnAbmelden" value="Abmelden" onClick={() => history.push('/')}></input>
                
            </div>
            
           
        )
    }


}*/