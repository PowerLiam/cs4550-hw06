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
  const BECOME_OBSERVER = "become_observer";
  const BECOME_PLAYER = "become_player";
  const READY = "ready";
  


  //TODO: I guess if joining a game in progress, the server will send a "setup: false", so I don't have to do a ton?
  // TODO: basically, behavior differences between starting a new game, joining a game in setup, and joining an active game

  const [state, setState] = useState({ users: {}, game: 0, setup: true, rounds: []});

  const [frontState, setFrontState] = useState({user: "", channel: ""});


// player: {ready: T/F, role: "player/"observer", won: []}
// {users: {}, game: 0, setup: true, rounds: []}

//TODO: duplicate usernames?
  function signin(displayText){
    let player = {ready: false, role: "observer", won: []}
    let temp = state.users;
    temp[displayText.name] = player;
    //TODO send this to the server instead of setting it
    setState({users: temp, game: state.game, setup: state.setup, rounds: state.rounds});
    setFrontState({user: displayText.name, channel: displayText.game});
    //don't use the front state values here since they're async and may not have updated yet
    joinChannel(CHANNEL_CATEGORY, displayText.game, displayText.name, setState);
    return;
  }
  
  function reset(){
    setFrontState({user: "", channel: ""});
    //TODO ACTUALLY LEAVE THE CHANNEL
  }
  
  function ready(){
    let temp = state.users;
    temp[frontState.user].ready = !temp[frontState.user].ready;
    setState({users: temp, game: state.game, setup: state.setup, rounds: state.rounds});
    //TODO ACTUALLY PUSH A READY/UNREADY UPDATE TO THE SERVER INSTEAD OF SETTiNG IT HERE
  }

  function swapRole(){
    if(isObserver()){
      pushChannel(CHANNEL_CATEGORY, frontState.channel, frontState.user, BECOME_PLAYER, {})
    }
    else{
      pushChannel(CHANNEL_CATEGORY, frontState.channel, frontState.user, BECOME_OBSERVER, {})
    }
  }

  function signingIn(){
    return frontState.user === "" && frontState.channel === ""; 
  }
  
  function isObserver(){
    return state.users[frontState.user].role === "observer"
  }

  return (
    <div className="FourDigitGame">
    {signingIn() && <Signin handleSignin={signin}></Signin>}
    {!signingIn() && state.setup && <Setup reset={reset} swapRole={swapRole} readyFunction={ready} gameName={frontState.channel} state={state}/>}
    {!signingIn() && !state.setup && <div className="ActualGame">
      <GuessEntry
      reset={reset}
      disabled={isObserver()}
        handleGuess={(guess) =>
          pushChannel(CHANNEL_CATEGORY, frontState.channel, frontState.user, GUESS_PUSH_TYPE, {
            guess,
          })
        }
      ></GuessEntry>
      <GuessDisplay state={state}></GuessDisplay>
      </div>}
    </div>
  );
}

export default FourDigitGame;
