'use strict';
import React from 'react';
import Plot from 'react-plotly.js';

const e = React.createElement;

class Stockchart extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            stockChartXValues: [],
            stockChartYValues: []
        }
    }

    render() {
        return e(
        <div>
            <h1>Chart</h1>
            <Plot
                data={[
                {
                    x: [1, 2, 3],
                    y: [2, 6, 3],
                    type: 'scatter',
                    mode: 'lines+markers',
                    marker: {color: 'red'},
                },
                {type: 'bar', x: [1, 2, 3], y: [2, 5, 3]},
                ]}
                layout={ {width: 320, height: 240, title: 'A Fancy Plot'} }
            />
        </div>
        );
    }
}


const domContainer = document.querySelector('stockchart_container');
ReactDOM.render(e(Stockchart), domContainer);


