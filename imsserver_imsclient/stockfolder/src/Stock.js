import React from 'react';
import axios from 'axios';

const SERVER = process.env.SERVER || "localhost";
class Stock extends React.Component {

    constructor(props) {
        super(props);
            this.state = {
                stockChartXValues: [],
                stockChartYValues: []
            }
        }
    
    componentDidMount() {
        this.fetchdata()
        
    }

    fetchdata() {
        axios.post(`http://${SERVER}:8080/fetch_data`, {
            // definition of actual content that should be sned with post as JSON
            post_content: '{"symbol": "IBM", "time": "Daily"}'
        })
            .then(res => {
                // This is executed if the server returns an answer:
                // Status code represents: https://de.wikipedia.org/wiki/HTTP-Statuscode
                console.log(`statusCode: ${res.status}`)
                // Print out actual data:
                console.log(res.data)
            })
            .catch(error => {
                // This is executed if there is an error:
                console.error(error)
            })
    }

    
    render() {
        return (
            <div>
                <h1>Aktienchart</h1>
            </div>
        )//end return
    } //end render
} //end React Component

export default Stock;