import "../css/GuessDisplay.css";

function makeRow(playerAndGuess, round){
  return(
    <div className="GuessDisplay-row" key={playerAndGuess[0] + round}>
      <div>{playerAndGuess[0]}: </div>
      <div>{playerAndGuess[1].guess}</div>
      <div>Bulls: {playerAndGuess[1].bulls}</div>
      <div>Cows: {playerAndGuess[1].cows}</div>
    </div>
  )
}


function GuessDisplay({ state: { rounds } }) {
  return (
    <div className="GuessDisplay">
      <div className="GuessDisplay-list">
        {rounds.map((players, i) => (
          <div className="GuessDisplay-element" key={i}> Round {i + 1}: {Object.entries(players).map( function(x) { return makeRow(x, i); })}
          </div>
        ))}
     </div>
   </div>   
  )
}


export default GuessDisplay;
