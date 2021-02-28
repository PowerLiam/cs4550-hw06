import "../css/GuessDisplay.css";

function makeRow(playerAndGuess, round) {
  return (
    <div className="GuessDisplay-row" key={playerAndGuess[0] + round}>
      <div className="GuessDisplay-playerlabel">{playerAndGuess[0]}: </div>
      <div>{playerAndGuess[1].guess}</div>
      <div>Bulls: {playerAndGuess[1].bulls}</div>
      <div>Cows: {playerAndGuess[1].cows}</div>
    </div>
  );
}

function GuessDisplay({ state: { rounds } }) {
  let reversed_rounds = rounds.slice().reverse();
  return (
    <div className="GuessDisplay">
      <div className="GuessDisplay-list">
        {reversed_rounds.map((round, i) => (
          <div
            className="GuessDisplay-element"
            key={reversed_rounds.length - i}
          >
            <span className="GuessDisplay-label">
              Round {reversed_rounds.length - i}:{" "}
            </span>
            {Object.entries(round).map(function (x) {
              return makeRow(x, i);
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

export default GuessDisplay;
