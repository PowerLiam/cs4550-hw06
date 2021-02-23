import "../css/FourDigitGame.css";
import { useEffect, useState } from "react";
import GuessDisplay from "./GuessDisplay.js";
import GuessEntry from "./GuessEntry.js";
import { joinChannel, pushChannel } from "./socket.js";

function FourDigitGame() {
  const CHANNEL_CATEGORY = "game";
  const CHANNEL_ID = "1";
  const USER = "testuser";
  const GUESS_PUSH_TYPE = "guess";

  const [state, setState] = useState({ guesses: [] });

  useEffect(() => {
    joinChannel(CHANNEL_CATEGORY, CHANNEL_ID, USER, setState);
  }, [CHANNEL_CATEGORY, CHANNEL_ID, USER]);

  function won() {
    return state.guesses.reduce((acc, guess) => {
      return acc || guess.bulls === 4;
    }, false);
  }

  function lost() {
    return !won() && livesRemaining() === 0;
  }

  function livesRemaining() {
    return 8 - state.guesses.length;
  }

  return (
    <div className="FourDigitGame">
      <GuessDisplay state={state}></GuessDisplay>
      <GuessEntry
        handleGuess={(guess) =>
          pushChannel(CHANNEL_CATEGORY, CHANNEL_ID, USER, GUESS_PUSH_TYPE, {
            guess,
          })
        }
      ></GuessEntry>
      <div>
        <h2>Lives remaining: {8 - state.guesses.length}</h2>
      </div>
      {lost() && <h1>You lose... Try again by pressing reset!</h1>}
      {won() && <h1>You win!!!</h1>}
    </div>
  );
}

export default FourDigitGame;
