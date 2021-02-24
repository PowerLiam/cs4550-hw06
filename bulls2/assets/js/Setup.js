import "../css/Setup.css";
import { useState } from "react";

function Setup({ reset, swapRole, readyFunction, gameName, state}) {

  function parsePlayers(playerDetails){
  console.log(playerDetails);
    return(
      <div className="Player-element" key={playerDetails[0]}>
        <div className="Player-details" key={playerDetails[0]}>
          <div>{playerDetails[0]}</div>    
          <div>Ready? {playerDetails[1].ready.toString()}</div>
          <div>Role: {playerDetails[1].role}</div>
          <div>Won games: {playerDetails[1].won.toString()}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="Setup">
      <div className="PlayerDisplay-list">
      <h1>Current Players:</h1> 
        {Object.entries(state.users).map(parsePlayers)}
      </div>
      <button onClick={readyFunction}>Ready or Unready</button>
      <button onClick={swapRole}>Switch Player/Observer</button>
      <button onClick={reset}>Leave Game</button>
    </div>
 )
 }

export default Setup;
