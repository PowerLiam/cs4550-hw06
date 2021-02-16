import "./FourDigitGame.css";
import GuessDisplay from "./GuessDisplay.js";
import GuessEntry from "./GuessEntry.js";
import { useState } from "react";

function FourDigitGame() {
  const [won, setWon] = useState(false);
  const [secret, setSecret] = useState(generateSecret);
  const [guesses, setGuesses] = useState([]);

  function generateSecret() {
    let secret = "";
    let usedDigits = new Set();

    for (let i = 0; i < 4; i++) {
      while (true) {
        let candidateDigit = Math.floor(Math.random() * 10);

        if (!usedDigits.has(candidateDigit)) {
          secret += candidateDigit;
          usedDigits.add(candidateDigit);
          break;
        }
      }
    }

    console.log(secret);

    return secret;
  }

  function validateGuess(candidateSecret) {
    let digits = candidateSecret.split("");

    if (!(digits.length === 4)) {
      return false;
    }

    return areUniqueDigits(digits);
  }

  function isDigit(value) {
    return /^\d$/.test(value);
  }

  function areUniqueDigits(digits) {
    return digits.reduce(
      ({ usedDigits, result }, cur) =>
        usedDigits.has(cur) || !isDigit(cur)
          ? { usedDigits: usedDigits.add(cur), result: false }
          : { usedDigits: usedDigits.add(cur), result: result && true },
      { usedDigits: new Set(), result: true }
    ).result;
  }

  function reset() {
    setGuesses([]);
    setSecret(generateSecret());
    setWon(false);
  }

  function handleGuess(guess) {
    if (guesses.length <= 8 && validateGuess(guess)) {
      if (guess === secret) {
        setWon(true);
      }
      setGuesses(guesses.concat(guess));
    }
  }

  return (
    <div className="FourDigitGame">
      <GuessDisplay guesses={guesses} secret={secret}></GuessDisplay>
      <GuessEntry handleGuess={handleGuess}></GuessEntry>
      <button onClick={reset}>Reset</button>
      {won && <h1>You win!!!</h1>}
    </div>
  );
}

export default FourDigitGame;
