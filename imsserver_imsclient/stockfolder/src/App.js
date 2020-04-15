import React from 'react';
import { Router, Switch, Route } from 'react-router-dom';
import HomeApp from './HomeApp';
import LoginApp from './LoginApp';
import StockApp from './StockApp';
import './App.css';
import history from './history';
import Headerline from './Headerline';




class App extends React.Component {
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
    <Router history={history}>
        <div>
          
          <hr />
          <Switch>
              <Route exact path='/' component={LoginApp} />
              <Route path='/Home' component={HomeApp} />
              <Route path='/Stock' component={StockApp} />
          </Switch>
        </div>
      </Router>
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

/*
 render() {
    return (
      <div className='app'>
        <Stock></Stock>
        <Table></Table>
        <button onClick={this.togglePopup.bind(this)}>show popup</button>
        <button onClick={() => {alert('woooooooot?');}}>try me when popup is open</button>
        {this.state.showPopup ? 
          <Popup
            text='Close Me'
            closePopup={this.togglePopup.bind(this)}
          />
          : null
        }
      </div>
    );
  }
*/
export default App;
