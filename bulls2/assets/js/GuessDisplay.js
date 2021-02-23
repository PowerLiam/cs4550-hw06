import "../css/GuessDisplay.css";

function GuessDisplay({ state: { won, secret, guesses } }) {
  return (
    <div className="GuessDisplay">
      <div className="GuessDisplay-list">
        {guesses.map(({ guess, cows, bulls }, i) => (
          <div className="GuessDisplay-element" key={guess}>
            <div>{guess}</div>
            <div>Bulls: {bulls}</div>
            <div>Cows: {cows}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default GuessDisplay;
