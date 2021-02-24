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
  const [frontState, setFrontState] = useState({user: "", channel: ""});


// player: {ready: T/F, role: "player/"observer", won: []}
// {users: {}, game: 0, setup: true, rounds: []}

//TODO: duplicate usernames?
  function signin(displayText){
    let player = {ready: false, role: "observer", won: []}
    let temp = testState.users;
    temp[displayText.name] = player;
    setTestState({users: temp, game: testState.game, setup: testState.setup, rounds: testState.rounds});
    setFrontState({user: displayText.name, channel: displayText.game});
    joinChannel(CHANNEL_CATEGORY, displayText.name, displayText.gamer, setTestState);
    return;
  }
  
  function reset(){
    setFrontState({user: "", channel: ""});
    //TODO ACTUALLY LEAVE THE CHANNEL
  }
  
  function ready(){
    let temp = testState.users;
    temp[frontState.user].ready = !temp[frontState.user].ready;
    setTestState({users: temp, game: testState.game, setup: testState.setup, rounds: testState.rounds});
    //TODO ACTUALLY PUSH A READY/UNREADY UPDATE TO THE SERVER
  }

  function swapRole(){
    let temp = testState.users;
    if(temp[frontState.user].role === "observer"){
      temp[frontState.user].role = "player";
    }
    else{
      temp[frontState.user].role = "observer";
    }
    setTestState({users: temp, game: testState.game, setup: testState.setup, rounds: testState.rounds});
    //TODO ACTUALLY PUSH A ROLE UPDATE TO THE SERVER
  }

  function signingIn(){
    return frontState.user === "" && frontState.channel === ""; 
  }
  
  //WON checking is game functionality and so if anyone wins, we go back to the setup with this game number tacked on, which would be done by an updatestate from elixir
  //TODO: Liam I have win checking in elixir if that's helpful

  return (
    <div className="FourDigitGame">
    {signingIn() && <Signin handleSignin={signin}></Signin>}
    {!signingIn() && testState.setup && <Setup reset={reset} swapRole={swapRole} readyFunction={ready} gameName={frontState.channel} state={testState}/>}
    {!signingIn() && !testState.setup && <div className="ActualGame">
      <GuessEntry
      reset={reset}
        handleGuess={(guess) =>
          pushChannel(CHANNEL_CATEGORY, frontState.channel, frontState.user, GUESS_PUSH_TYPE, {
            guess,
          })
        }
      ></GuessEntry>
      <GuessDisplay state={testState}></GuessDisplay>
      </div>}
    </div>
  );
}

export default FourDigitGame;
