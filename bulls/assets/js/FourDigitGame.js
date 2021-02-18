import "../css/FourDigitGame.css";
import { useEffect, useState } from "react";
import GuessDisplay from "./GuessDisplay.js";
import GuessEntry from "./GuessEntry.js";
import { joinChannel, pushChannel, resetChannel } from "./socket.js";

function FourDigitGame() {
  const channelCategory = "game";
  const channelId = "1";

  const [state, setState] = useState(() => {
    return {
      guesses: [],
    };
  });

  useEffect(() => {
    joinChannel(channelCategory, channelId, setState);
  }, [channelCategory, channelId]);

  function reset() {
    resetChannel(channelCategory, channelId);
  }

  function won() {
    return state.guesses.reduce((guess, acc) => {
      console.log(guess.bulls);
      console.log(acc || guess.bulls === 4);
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
          pushChannel(channelCategory, channelId, { guess })
        }
      ></GuessEntry>
      <button onClick={() => resetChannel(channelCategory, channelId)}>
        Reset
      </button>
      <div>
        <h2>Lives remaining: {8 - state.guesses.length}</h2>
      </div>
      {lost() && <h1>You lose... Try again by pressing reset!</h1>}
      {won() && <h1>You win!!!</h1>}
    </div>
  );
}

export default FourDigitGame;
