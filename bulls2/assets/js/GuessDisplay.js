import "../css/GuessDisplay.css";

function GuessDisplay({ state: { won, secret, guesses } }) {
  return (
    <div className="GuessDisplay">
      <div className="GuessDisplay-list">
        {guesses.map(({ guess, cows, bulls2 }, i) => (
          <div className="GuessDisplay-element" key={guess}>
            <div>{guess}</div>
            <div>Bulls2: {bulls2}</div>
            <div>Cows: {cows}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default GuessDisplay;
