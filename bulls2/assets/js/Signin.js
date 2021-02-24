//import "../css/Signin.css";
import { useState } from "react";

function Signin({ handleSignin }) {
  const [displayText, setDisplayText] = useState({name: "", game: ""});

  function updateName(ev) {
    setDisplayText({name: ev.target.value, game: displayText.game});
  }

  function updateGame(ev) {
    setDisplayText({name: displayText.name, game: ev.target.value});
  }

  function keyPress(ev) {
    if (ev.key === "Enter") {
      handleSigninInternal(displayText);
    }
  }

  function handleSigninInternal() {
    handleSignin(displayText);
    setDisplayText("");
  }

  return (
    <div className="Signin">
    <div>Username: </div>
      <input
        type="text"
        value={displayText.name}
        onChange={updateName}
        onKeyPress={keyPress}
      ></input>
    <div>Game name: </div>
      <input
        type="text"
        value={displayText.game}
        onChange={updateGame}
        onKeyPress={keyPress}
      ></input>
      <div>
        <button onClick={() => handleSigninInternal(displayText)}>Signin</button>
      </div>
    </div>
  );
}

export default Signin;
