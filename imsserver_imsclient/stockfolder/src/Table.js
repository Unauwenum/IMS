import React, { Component } from 'react'
import axios from 'axios';

const SERVER = process.env.SERVER || "localhost";
var time = "change";
var symbol = "IBM"
let url;
var symbol;
class Table extends Component {
    
    constructor(props) {
       super(props) //since we are extending class Table so we have to use super in order to override Component class constructor
       this.state = { //state is by default an object
          sharedata: [
             { Aktie: "-", Wert: "-", Veränderung: "-" },
             
          ]
       }
    }

    componentDidMount() {
      this.fetchdata()
      
  }
  fetchdata () {
   url = window.location.href;
   symbol = url.substring(34,url.length);
   const pointer = this;
         var wert;
         var veränderung;
        console.log(pointer);
        axios.post(`http://${SERVER}:8080/fetch_data`, {
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
                  wert = wert+"$";
                  
                  var helpnumber = res.data.change
                  helpnumber = helpnumber *100;
                  veränderung = helpnumber.toFixed(2);
                  veränderung = veränderung +'%';
                  pointer.setState({
                     sharedata: [{Aktie: symbol,
                     Wert: wert,
                     Veränderung: veränderung}]
                 })

               
            })
            .catch(error => {
                // This is executed if there is an error:
                console.error(error)
            })

  }
    renderTableData() {
        return this.state.sharedata.map((sharedata, index) => {
           const { Aktie, Wert, Veränderung } = sharedata //destructuring
           return (
              <tr key={Aktie}>
                 <td>{Aktie}</td>
                 <td>{Wert}</td>
                 <td>{Veränderung}</td>
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
           <div>
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
 
 

 
 export default Table 