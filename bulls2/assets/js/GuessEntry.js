import "../css/GuessEntry.css";
import { useState } from "react";

function GuessEntry({ disabled, reset, handleGuess }) {
  const [displayText, setDisplayText] = useState("");

  function updateText(ev) {
    setDisplayText(ev.target.value);
  }

  function keyPress(ev) {
    if (ev.key === "Enter") {
      handleGuessInternal(displayText);
    }
  }

  function handleGuessInternal(displayText) {
    handleGuess(displayText);
    setDisplayText("");
  }

  return (
    <div className="GuessEntry">
      <input
        type="text"
        value={displayText}
        onChange={updateText}
        onKeyPress={keyPress}
        disabled={disabled}
      ></input>
      <button disabled={disabled} onClick={() => handleGuessInternal(displayText)}>Guess</button>
      <button disabled={disabled} onClick={() => handleGuessInternal("pass")}>Pass</button>
      <button onClick={reset}>Leave Game</button>
    </div>
  );
}

export default GuessEntry;
