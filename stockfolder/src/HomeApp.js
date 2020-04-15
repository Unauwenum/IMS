import React from 'react';
import Table1 from './Table1';
import Table2 from './Table2';
import Headerline from './Headerline';
import mycookie from './Cookie';
class HomeApp extends React.Component {

    componentDidMount(){
        
    }
    
    render() {
        
        return(
            <div>
                <Headerline></Headerline>
                <div >
                <br>
                </br>
                <br></br>
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