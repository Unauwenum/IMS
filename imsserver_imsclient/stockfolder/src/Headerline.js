import React from 'react';

class Headerline extends React.Component {
    render() {
        return(
            <div id="header">
            <p class="headerElements">Depowert:</p>
             <p class="headerElements" id="pDepowertHeader">--</p>
            <p class="headerElements">Bargeld:</p>
            <p class="headerElements" id="pBargeldHeader">--</p>
            <p class="headerElements">Veränderung (letzten 24h):</p>
            <p class="headerElements" id="pVeränderungHeader">--</p>
            <p class="headerElements">Angemeldet als:</p>
            <p class="headerElements" id="pAngemeldetHeader">--</p> 
            <input type="button" class="headerElements"  id="btnAbmelden" value="Abmelden"></input>
                
            </div>
            
           
        )
    }


}

export default Headerline;