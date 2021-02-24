import "../css/FourDigitGame.css";
import { useEffect, useState } from "react";
import Signin from "./Signin.js";
import Setup from "./Setup.js";
import GuessDisplay from "./GuessDisplay.js";
import GuessEntry from "./GuessEntry.js";
import { joinChannel, pushChannel } from "./socket.js";

function FourDigitGame() {
  const CHANNEL_CATEGORY = "game";
  const CHANNEL_ID = "1";
  const USER = "testuser";
  const GUESS_PUSH_TYPE = "guess";


  //TODO: I guess if joining a game in progress, the server will send a "setup: false", so I don't have to do a ton?
  // TODO: basically, behavior differences between starting a new game, joining a game in setup, and joining an active game

  const [state, setState] = useState({ guesses: [] });
  const [testState, setTestState] = useState({ users: {
    "player1": {
      "ready": false,
      "role": "player",
      "won": [1,3]
    },
    "player2": {
      "ready": false,
      "role": "player",
      "won": [4]
    },
    "player3": {
      "ready": false,
      "role": "player",
      "won": [2]
    },
    "player4": {
      "ready": false,
      "role": "observer",
      "won": []
    }
  }, game: 0, setup: false, rounds: [{
      "player1": {"guess" : "1234", "cows": 2, "bulls": 2}, 
      "player2": {"guess" : "5678", "cows": 2, "bulls": 2}, 
      "player3": {"guess" : "pass", "cows": 0, "bulls": 0}
    },
    {
      "player1": {"guess" : "2345", "cows": 1, "bulls": 2}, 
      "player2": {"guess" : "7654", "cows": 1, "bulls": 0}, 
      "player3": {"guess" : "1634", "cows": 2, "bulls": 0}
    },
    {
      "player1": {"guess" : "pass", "cows": 0, "bulls": 0}, 
      "player2": {"guess" : "pass", "cows": 0, "bulls": 0}, 
      "player3": {"guess" : "1624", "cows": 2, "bulls": 0}
    }] });

  //front state doesn't actually have to be in a useState, because it is solely used in the frontend and all changes that would require rerender update one of the actual useStates
  let frontState = {user: "", channel: ""}


// player: {ready: T/F, role: "player/"observer", won: []}
// {users: {}, game: 0, setup: true, rounds: []}

  function won() {
    return state.guesses.reduce((acc, guess) => {
      return acc || guess.bulls === 4;
    }, false);
  }


//TODO: duplicate usernames?
  function signin(displayText){
    let player = {ready: false, role: "observer", won: []}
    let temp = testState.users;
    temp[displayText.name] = player;
    setTestState({users: temp, game: testState.game, setup: testState.setup, rounds: testState.rounds});
    frontState.user = displayText.name;
    frontState.channel = displayText.game
    joinChannel(CHANNEL_CATEGORY, frontState.channel, frontState.user, setState);
  }
  
  function ready(){
    let temp = testState.users;
    temp[frontState.user].ready = !temp[frontState.user].ready;
    setTestState({users: temp, game: testState.game, setup: testState.setup, rounds: testState.rounds});
    console.log("after: " + temp[frontState.user].ready);
    //TODO ACTUALLY PUSH A READY/UNREADY UPDATE TO THE SERVER
  }

  function signingIn(){
    return Object.keys(testState.users).length === 0 && testState.game === 0;
  }

  return (
    <div className="FourDigitGame">
    {signingIn() && <Signin handleSignin={signin}></Signin>}
	{console.log(testState)}
    {!signingIn() && testState.setup && <Setup readyFunction={ready} gameName={frontState.channel} state={testState}/>}
    {!signingIn() && !testState.setup && <div className="ActualGame">
      <GuessEntry
        handleGuess={(guess) =>
          pushChannel(CHANNEL_CATEGORY, frontState.channel, frontState.user, GUESS_PUSH_TYPE, {
            guess,
          })
        }
      ></GuessEntry>
      <GuessDisplay state={testState}></GuessDisplay>
      {won() && <h1>You win!!!</h1>}
      </div>}
    </div>
  );
}

export default FourDigitGame;
