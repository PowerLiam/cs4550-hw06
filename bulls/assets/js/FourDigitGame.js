import "../css/FourDigitGame.css";
import GuessDisplay from "./GuessDisplay.js";
import GuessEntry from "./GuessEntry.js";
import { useState } from "react";

function FourDigitGame() {
  // const [won, setWon] = useState(false);
  // const [secret, setSecret] = useState(generateSecret);
  // const [guesses, setGuesses] = useState([]);
  const [state, setState] = useState(() => {
    return {
      won: false,
      secret: generateSecret(),
      guesses: [],
    };
  });

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
    setState((prevState) => {
      return {
        won: false,
        secret: generateSecret(),
        guesses: [],
      };
    });
  }

  function getCowCount(guess) {
    let digits = guess.split("");
    let secretDigits = state.secret.split("");
    let secretDigitSet = new Set(secretDigits);

    return digits.reduce(
      (acc, cur, i) =>
        cur !== secretDigits[i] && secretDigitSet.has(cur) ? acc + 1 : acc,
      0
    );
  }

  function getBullCount(guess) {
    let digits = guess.split("");
    let secretDigits = state.secret.split("");

    return digits.reduce(
      (acc, cur, i) => (cur === secretDigits[i] ? acc + 1 : acc),
      0
    );
  }

  function handleGuess(guess) {
    if (state.guesses.length < 8 && validateGuess(guess)) {
      if (guess === state.secret) {
        setState((prevState) => {
          return {
            won: true,
            secret: prevState.secret,
            guesses: prevState.guesses,
          };
        });
      }
      setState((prevState) => {
        return {
          won: prevState.won,
          secret: prevState.secret,
          guesses: prevState.guesses.concat({
            guess,
            cows: getCowCount(guess),
            bulls: getBullCount(bulls),
          }),
        };
      });
    }
  }

  return (
    <div className="FourDigitGame">
      <GuessDisplay state={state}></GuessDisplay>
      <GuessEntry handleGuess={handleGuess}></GuessEntry>
      <button onClick={reset}>Reset</button>
      {state.won && <h1>You win!!!</h1>}
    </div>
  );
}

export default FourDigitGame;
