import React from 'react';
import Stock from './Stock';
import Table from './Table';
import Popup from './Popup';
import history from './history';
import './App.css';





class StockApp extends React.Component {
  constructor() {
    super();
    this.state = {
      showPopup: false
    };
  }
  togglePopup() {
    this.setState({
      showPopup: !this.state.showPopup
    });
  }
  render() {
    return (
      <div className='app'>
        <br></br>
        <Stock></Stock>
        <Table></Table>
        <button onClick={this.togglePopup.bind(this)}>Aktie kaufen</button>
        <button onClick={() => history.push('/Home')}>Zurück zur Depotübersicht</button>
        {this.state.showPopup ? 
          <Popup
            
            closePopup={this.togglePopup.bind(this)}
          />
          : null
        }
      </div>
    );
  }
};

/*
function App() {
  return (
    <div className="App">
      <Stock></Stock>
      <Table></Table>
      <Popup></Popup>
    </div>
  );
}
*/
export default StockApp;
