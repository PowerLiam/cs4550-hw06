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
    return state.guesses.reduce(
      (guess, acc) => acc && guess.bulls === 4,
      false
    );
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
      {won() && <h1>You win!!!</h1>}
    </div>
  );
}

export default FourDigitGame;
