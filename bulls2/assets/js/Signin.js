//import "../css/Signin.css";
import { useState } from "react";

function Signin({ handleSignin }) {
  const [sessionInfo, setSessionInfo] = useState({name: "", game: ""});

  function updateName(ev) {
    setSessionInfo({name: ev.target.value, game: sessionInfo.game});
  }

  function updateGame(ev) {
    setSessionInfo({name: sessionInfo.name, game: ev.target.value});
  }

  function keyPress(ev) {
    if (ev.key === "Enter") {
      handleSigninInternal(sessionInfo);
    }
  }

  function handleSigninInternal() {
    handleSignin(sessionInfo);
    setSessionInfo("");
  }

  return (
    <div className="Signin">
    <div>Username: </div>
      <input
        type="text"
        value={sessionInfo.name}
        onChange={updateName}
        onKeyPress={keyPress}
      ></input>
    <div>Game name: </div>
      <input
        type="text"
        value={sessionInfo.game}
        onChange={updateGame}
        onKeyPress={keyPress}
      ></input>
      <div>
        <button onClick={() => handleSigninInternal(sessionInfo)}>Signin</button>
      </div>
    </div>
  );
}

export default Signin;
