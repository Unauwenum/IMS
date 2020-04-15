import React, { Component } from 'react'
import axios from 'axios';
import history from './history';

const SERVER = process.env.SERVER || "localhost";
var time = "change";
var symbol = "IBM"
var tabelleninhalt = [];
class Table1 extends Component {
    
    constructor(props) {
       super(props) //since we are extending class Table so we have to use super in order to override Component class constructor
       this.state = { //state is by default an object
          sharedata: [
             { Aktie: "-", Wert: "-", Veränderung: "-" },
             
          ]
       }
    }

    componentDidMount() {
      this.fetchsymbols();
      this.fetchdata();
      var object = new Object();
      object.Aktie = "IBM";
      object.Wert = "314$";
      object.Veränderung = "0,35%";
      tabelleninhalt[0] = object
      tabelleninhalt[1] = object
      this.setState({
        sharedata: tabelleninhalt
      })
      console.log(object);
      
  }
  fetchsymbols() {
    
    const pointer = this;
         
         var object = new Object();
         var wert;
         var veränderung;
        console.log(pointer);
        axios.post(`http://${SERVER}:8080/fetch_stocksymbols`, {
            // definition of actual content that should be sned with post as JSON
            post_content: `Request for symbols`
        })
            .then(res => {
                // This is executed if the server returns an answer:
                // Status code represents: https://de.wikipedia.org/wiki/HTTP-Statuscode
                console.log(`statusCode: ${res.status}`)
                // Print out actual data:
                //alles symbole in einem Array
                console.log(res.data);
                for ( var i = 0; i < res.data.length; i++) {
                 
                    object = new Object();
                    object.Aktie = res.data[i].symbol
                    tabelleninhalt[i] = object
                    console.log(tabelleninhalt[i]);
                    console.log(tabelleninhalt[i].Aktie);
                }//end for
                //hier wird für jedes symbol die werte zugewiesen
               this.fetchdata();
            }) //endthen
            .catch(error => {
                // This is executed if there is an error:
                console.error(error)
            })

  }
  //für jedes Object bzw symbol in tabelleninhalt wwerden wert und veränderung hinzugefügt
  async fetchdata () {
     console.log('getht in fetch data rein');
     console.log(tabelleninhalt.length);
    const pointer = this;
  
   for( var i = 0; i < tabelleninhalt.length; i ++){
        console.log(i);
        console.log('start durchlauf');
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
                console.log(res.data)
                console.log(res.data.wert)
                  var helpnumber2 = res.data.wert;
                  wert = helpnumber2 - 0;
                  wert = wert+"$"
                  console.log(tabelleninhalt[i]);
                  tabelleninhalt[i].Wert = wert
                  
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
        
        pointer.setState({
            sharedata: tabelleninhalt
            })

  }








    onButtonclicked(e) {
      console.log(e.target.id);
      history.push('/Stock?Aktie='+e.target.id);
    }
    renderTableData() {
        
        return this.state.sharedata.map((sharedata, index) => {
           const { Aktie, Wert, Veränderung } = sharedata //destructuring
           return (
              <tr key={Aktie}>
                 <td>{Aktie}</td>
                 <td>{Wert}</td>
                 <td>{Veränderung}</td>
                 <td><button id = {Aktie} onClick={(e)=>this.onButtonclicked(e)} >Kaufen</button></td>
              </tr>
           )
        })
     }
     renderTableHeader() {
        let header = Object.keys(this.state.sharedata[0])
        return header.map((key, index) => {
           return <th key={index}>{key.toUpperCase()}</th>
        })
     }
 
     render() {
        return (
           <div id='uebersicht'>
              <table id='sharedata'>
                 <tbody>
                    <tr>{this.renderTableHeader()}</tr>
                    {this.renderTableData()}
                 </tbody>
              </table>
           </div>
        )
     }
  
 }
 
 

 
 export default Table1 