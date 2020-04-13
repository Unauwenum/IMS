import React from 'react';
import axios from 'axios';
import Plot from 'react-plotly.js';





const SERVER = process.env.SERVER || "localhost";
var time = "Daily";
var symbol = "IBM"
class Stock extends React.Component {

    constructor(props) {
        super(props);
            this.state = {
                stockChartXValues: [],
                stockChartYValues: [],
                time: "Realtime"
            }
        }
    
    componentDidMount() {
        this.fetchdata()
        
    }

    fetchdata() {
        const pointer = this;
        let stockChartXValuesFunction = [];
        let stockChartYValuesFunction = [];
        console.log(pointer);
        axios.post(`http://${SERVER}:8080/fetch_data`, {
            // definition of actual content that should be sned with post as JSON
            post_content: `{"symbol": "${symbol}", "time": "${this.state.time}"}`
        })
            .then(res => {
                // This is executed if the server returns an answer:
                // Status code represents: https://de.wikipedia.org/wiki/HTTP-Statuscode
                console.log(`statusCode: ${res.status}`)
                // Print out actual data:
                console.log(res.data)
                console.log(res.data[0])
                for(var i = 0; i<res.data.length; i++) {
                    stockChartXValuesFunction.push(res.data[i].time);
                    stockChartYValuesFunction.push(res.data[i].close)
                }

                pointer.setState({
                    stockChartXValues: stockChartXValuesFunction,
                    stockChartYValues: stockChartYValuesFunction
                })
            })
            .catch(error => {
                // This is executed if there is an error:
                console.error(error)
            })
    }
    onIntradayClicked() {
        this.setState({
          time: "Realtime"
        });
        this.fetchdata();
        this.render();
      }
      onDailyClicked() {
        this.setState({
          time: "Daily"
        })
        this.fetchdata();
        this.render();
        console.log('er geht rein');
      }  
    renderPlot() {
        return(<Plot
            data={[
                {
                    x: this.state.stockChartXValues,
                    y: this.state.stockChartYValues,
                    type: 'scatter',
                    mode: 'lines+markers',
                    marker: {color: 'red'},

                },
            ]}
            layout= { {width: 720, height: 440, title: `Aktie: ${symbol}`}}

             />)
    }
    render() {
        return (
            <div>
                <h1>Aktienchart</h1>
                {this.renderPlot()}
                 <br></br>
                 <button onClick={()=>this.onIntradayClicked()}>Intraday</button>
                 <button onClick={()=>this.onDailyClicked()}>Daily</button>
                 <br></br>
            </div>
        )//end return
    } //end render
} //end React Component

export default Stock;