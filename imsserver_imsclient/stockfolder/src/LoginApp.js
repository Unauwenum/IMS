
import React from "react";
import history from "./history";
import "./Login.css";
import axios from 'axios';
const SERVER = process.env.SERVER || "localhost";

class LoginApp extends React.Component {

    constructor(props) {
        super(props);
            this.state = {
                user: "",
                password: "",
                depotid: "",
                userid: "",
                loggedin: false
            }
            this.handleChangePassword = this.handleChangePassword.bind(this);
            this.handleChangeUser = this.handleChangeUser.bind(this);
            this.handleSubmit = this.handleSubmit.bind(this);
        }
  validateForm() {
    return this.state.user.length > 0 && this.state.password.length > 0;
  }

  handleChangePassword(event) {
      this.setState({password: event.target.value});
  }
  handleChangeUser(event) {
      this.setState({user: event.target.value});
  }
  handleSubmit(event) {
    event.preventDefault();
    //User überprüfen
    axios.post(`http://${SERVER}:8080/fetch_user`, {
            // definition of actual content that should be sned with post as JSON
            post_content: `{"user": "${this.state.user}", "password": "${this.state.password}"}`
        })
            .then(res => {
                // This is executed if the server returns an answer:
                // Status code represents: https://de.wikipedia.org/wiki/HTTP-Statuscode
                console.log(`statusCode: ${res.status}`)
                // Print out actual data:
                console.log(res.data)
                console.log(res.data[0])
                if(res.data.status) {
                this.setState({
                    loggedin: res.data.status,
                    userid: res.data.userid,
                    depotid: res.data.depotid
                })
                }
            })
            .catch(error => {
                // This is executed if there is an error:
                console.error(error)
            })
    if(this.state.loggedin) {
        
        history.push('/Home')
    } else {
        alert('LoginFailed');
    }
  }
  
  
render() {
  return (
    <div className="Login">
      <form onSubmit={this.handleSubmit}>
        <label>
            User:
            <input type="text" value={this.state.user} onChange={this.handleChangeUser} />
        </label>
        <label>
            Password:
            <input type="password" value={this.state.password} onChange={this.handleChangePassword} />
        </label>
        <input type="submit" value="Absenden" disabled={!this.validateForm()} />
        
      </form>
    </div>
  );
}
}

export default LoginApp;

/*
import React from 'react';
import ValidatedLoginForm from './Helpcomp/ValidatedLoginform'
class LoginApp extends React.Component {

    render (){
    return (
        <div className="App">
          <h1>Validated Login Form</h1>
          <ValidatedLoginForm />
        </div>
      );
    }

}

export default LoginApp;*/


