import React, { Component } from 'react'
import axios from 'axios';
import mycookie from './Cookie';
import Popup from './Popup2';
import history from './history';
const SERVER = process.env.SERVER || "localhost";
var time = "change";
var symbol;
var anzahl;
var tabelleninhalt;
var object;


 
class Table2 extends Component {
    
    constructor(props) {
       super(props) //since we are extending class Table so we have to use super in order to override Component class constructor
       this.state = { //state is by default an object
         showPopup: false, 
         verkaufaktie: "", //dieses Attribut wird beim Popupstart mitgegeben
         verkaufanzahl: "",
         sharedata: [
             { Aktie: "-", Anzahl: "-",Gesamtwert: "-", Veränderung: "-" },
             
          ],
         sharedataHeader: [
            { Akite: "", Anzahl: "", Gesamtwert: "", Veränderung: ""}
         ]
       }
    }

    componentDidMount() {
      this.fetchdepotinhalt()
      
  }
  //Aktie aus dem Button wird ausgelesen
  togglePopupup(e, e2) {
   console.log('event: '+JSON.stringify(e));
   this.setState({
     verkaufanzahl: e2,
     verkaufaktie: e,
     showPopup: !this.state.showPopup
   });
 }
  togglePopupdown() {
   this.setState({
      showPopup: !this.state.showPopup
   });
   this.fetchdepotinhalt();
  }


  fetchdepotinhalt() {
    
   const pointer = this;
        
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
                  wert = wert+"$"
                  console.log(tabelleninhalt[i]);
                  tabelleninhalt[i].Gesamtwert = wert
                  
                  var helpnumber = res.data.change
                  
                  /*
                  helpnumber = helpnumber *100;
                  veränderung = helpnumber.toFixed(2);
                  veränderung = veränderung +'%';
                  */
                 // indiesem Fall nehmen wir den change Wert und multiplizieren diesen mit dem Gesamtwert
                  tabelleninhalt[i].Veränderung = helpnumber * wert;
                  

               
            })
            .catch(error => {
                // This is executed if there is an error:
                console.error(error)
            })
         }
        
        pointer.setState({
            sharedata: tabelleninhalt
            })

  }

    onButtonVerkaufclicked(e) {
       
    }
    renderTableData() {
        return this.state.sharedata.map((sharedata, index) => {
           const { Aktie, Anzahl, Gesamtwert, Veränderung } = sharedata //destructuring
           return (
              <tr key={Aktie}>
                 <td>{Aktie}</td>
                 <td>{Anzahl}</td>
                 <td>{Gesamtwert}</td>
                 <td>{Veränderung}</td>
                 <td><button id = {Aktie} value = {Anzahl} onClick={this.togglePopupup.bind(this, {Aktie}, {Anzahl})} >Verkaufen</button></td>
                
              </tr>
           )
        })
     }
     renderTableHeader() {
        let header = Object.keys(this.state.sharedataHeader[0])
        return header.map((key, index) => {
           return <th key={index}>{key.toUpperCase()}</th>
        })
     }
 
     render() {
        return (
           <div div id='main'>
              <table id='sharedata'>
                 <tbody>
                    <tr>{this.renderTableHeader()}</tr>
                    {this.renderTableData()}
                 </tbody>
              </table>
              {this.state.showPopup ? 
            <Popup
            aktie={this.state.verkaufaktie}
            anzahl={this.state.verkaufanzahl}
            closePopup={this.togglePopupdown.bind(this)}
            />
            : null
          }
           </div>
        )
     }
  
 }
 
 

 
 export default Table2 