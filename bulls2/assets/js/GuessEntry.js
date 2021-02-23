import "../css/GuessEntry.css";
import { useState } from "react";

function GuessEntry({ handleGuess }) {
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
      ></input>
      <button onClick={() => handleGuessInternal(displayText)}>Guess</button>
    </div>
  );
}

export default GuessEntry;
