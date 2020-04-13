import React from 'react';
import axios from 'axios';
import histroy from './history';
import mycookie from './Cookie';
const SERVER = process.env.SERVER || "localhost";
var time = "change";
var symbol = "IBM"
var wert;
var Kontonummer = mycookie.kontonummer;
const UserID = mycookie.userid;

class Popup extends React.Component {
    constructor(props) {
    super(props) //since we are extending class Table so we have to use super in order to override Component class constructor
    this.state = { //state is by default an object
       buydata: 
          { Aktie: symbol, Wert: "0", Anzahl: "0", Gesamtwert: "0" },
    }
  }
  componentDidMount() {
    this.fetchdata()
    
}
  fetchdata() {
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
                  wert = res.data.wert;
                    
                    
  
                 
              })
              .catch(error => {
                  // This is executed if there is an error:
                  console.error(error)
              })
  
    } 
    
    onAnzahlChange(event) {
      this.setState({
        buydata: {Anzahl: parseInt(event.target.value), Aktie: symbol, Gesamtwert: wert*event.target.value}
      })
    }
    onKaufClicked() {
      //einfache Eingabeprüfung auf Integer
      if(Number.isInteger(this.state.buydata.Anzahl)){
      axios.post(`http://${SERVER}:8080/transaction`, {
              // definition of actual content that should be sned with post as JSON
              post_content: `{"UserID": "${UserID}", "Kontonummer": "${Kontonummer}", "Betrag": "${this.state.buydata.Gesamtwert}", "Transaktionsart": "Kauf", "Aktie": "${this.state.buydata.Aktie}", "Anzahl": "${this.state.buydata.Anzahl}"}`
          })
              .then(res => {
                  // This is executed if the server returns an answer:
                  // Status code represents: https://de.wikipedia.org/wiki/HTTP-Statuscode
                  console.log(`statusCode: ${res.status}`)
                  // Print out actual data:
                  console.log(res.data)
                  console.log(res.data.wert)
                  wert = res.data.wert;
                    
                    
  
                 
              })
              .catch(error => {
                  // This is executed if there is an error:
                  console.error(error)
              })

      } else { alert('Bitte geben Sie einen gültigen Wert ein. Es sindnur ganze Zahlen erlaubt')
      }//endIF 
    }
    
    render() {
      return (
        <div className='popup'>
          
          <div className='popup_inner'>
          <h1>{this.state.buydata.Aktie} kaufen:</h1>
          Anzahl: <input value={this.state.buydata.Anzahl} onChange={(e)=>this.onAnzahlChange(e)}></input>Gesamtpreis: {this.state.buydata.Gesamtwert}$:
          
          <button onClick={()=>this.onKaufClicked()}>Kauf bestätigen</button>
          <button onClick={this.props.closePopup}>Fertig</button>
          </div>
        </div>
      );
    }
}
  
  export default Popup;
  
  
  
