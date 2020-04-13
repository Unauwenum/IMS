import React from 'react';
import Table1 from './Hometables/Table1';
import Table2 from './Hometables/Table2';

class HomeApp extends React.Component {
    render() {
        return(
            <div>
                
                <div>
                <h2>Aktuelle Kurse</h2>
                <Table1></Table1>
                </div>
                <br></br>
                <div>
                <h2>Deine Aktien</h2>
                <Table2></Table2>
                </div>
            </div>
           
        )
    }


}

export default HomeApp;