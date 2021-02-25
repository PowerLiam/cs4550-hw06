import "../css/FourDigitGame.css";
import { useEffect, useState } from "react";
import Signin from "./Signin.js";
import Setup from "./Setup.js";
import GuessDisplay from "./GuessDisplay.js";
import GuessEntry from "./GuessEntry.js";
import { joinChannel, pushChannel, leaveChannel } from "./socket.js";

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

  const [state, setState] = useState({
    users: {},
    game: 0,
    setup: true,
    rounds: [],
  });

  const [frontState, setFrontState] = useState({ user: "", channel: "" });

  // player: {ready: T/F, role: "player/"observer", won: []}
  // {users: {}, game: 0, setup: true, rounds: []}

  //TODO: duplicate usernames?
  function signin(sessionInfo) {
    joinChannel(
      CHANNEL_CATEGORY,
      sessionInfo.game,
      sessionInfo.name,
      (state) => {
        setFrontState({ user: sessionInfo.name, channel: sessionInfo.game });
        setState(state);
      }
    );
  }

  function reset() {
    leaveChannel(CHANNEL_CATEGORY, frontState.channel, frontState.user, () =>
      setFrontState({ user: "", channel: "" })
    );

    //TODO ACTUALLY LEAVE THE CHANNEL
  }

  function ready() {
    pushChannel(CHANNEL_CATEGORY, frontState.channel, frontState.user, READY, {
      ready: !state.users[frontState.user].ready,
    });
  }

  function swapRole() {
    pushChannel(
      CHANNEL_CATEGORY,
      frontState.channel,
      frontState.user,
      isObserver() ? BECOME_PLAYER : BECOME_OBSERVER,
      {}
    );
  }

  function signingIn() {
    return frontState.user === "" && frontState.channel === "";
  }

  function isObserver() {
    return state.users[frontState.user].role === "observer";
  }

  return (
    <div className="FourDigitGame">
      {signingIn() && <Signin handleSignin={signin}></Signin>}
      {!signingIn() && state.setup && (
        <Setup
          reset={reset}
          swapRole={swapRole}
          readyFunction={ready}
          gameName={frontState.channel}
          state={state}
        />
      )}
      {!signingIn() && !state.setup && (
        <div className="ActualGame">
          <GuessEntry
            reset={reset}
            disabled={isObserver()}
            handleGuess={(guess) =>
              pushChannel(
                CHANNEL_CATEGORY,
                frontState.channel,
                frontState.user,
                GUESS_PUSH_TYPE,
                {
                  guess,
                }
              )
            }
          ></GuessEntry>
          <GuessDisplay state={state}></GuessDisplay>
        </div>
      )}
    </div>
  );
}

export default FourDigitGame;
