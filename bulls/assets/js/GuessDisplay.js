import "./GuessDisplay.css";

function GuessDisplay({ guesses, secret }) {
  function getCowCount(guess) {
    let digits = guess.split("");
    let secretDigits = secret.split("");
    let secretDigitSet = new Set(secretDigits);

    return digits.reduce(
      (acc, cur, i) =>
        cur !== secretDigits[i] && secretDigitSet.has(cur) ? acc + 1 : acc,
      0
    );
  }

  function getBullCount(guess) {
    let digits = guess.split("");
    let secretDigits = secret.split("");

    return digits.reduce(
      (acc, cur, i) => (cur === secretDigits[i] ? acc + 1 : acc),
      0
    );
  }

  return (
    <div className="GuessDisplay">
      <div className="GuessDisplay-list">
        {guesses.map((guess, i) => (
          <div className="GuessDisplay-element" key={guess}>
            <div>{guess}</div>
            <div>Bulls: {getBullCount(guess)}</div>
            <div>Cows: {getCowCount(guess)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default GuessDisplay;
