import { Socket } from "phoenix";

let socket = new Socket("/socket", {
  params: { token: "" /*window.userToken*/ },
});

socket.connect();

// Map from channels that have been joined to a list of their registered callbacks
let channelStates = {};

function getChannelName(category, id) {
  return category + ":" + id;
}

function updateState(category, id, state) {
  console.log("Updating state: ", state);

  let channelName = getChannelName(category, id);

  channelStates[channelName].state = state;
  // Call back each user interested in the state of this channel, even the ones
  // that didn't explicitly push the message that caused this state change.
  channelStates[channelName].callbacks.forEach((callback, _dup, _set) =>
    callback(state)
  );
}

export function joinChannel(category, id, stateCallback) {
  console.log("Joining channel " + getChannelName(category, id));

  let channelName = getChannelName(category, id);
  let channelState = channelStates[channelName];

  if (channelState === undefined) {
    channelStates[channelName] = {
      channel: socket.channel(channelName),
      callbacks: new Set(),
      // The user isn't called back with the state until it has been provided
      // from the server.
      state: undefined,
    };
    // This is the first attempt to join this channel, so the actual connection
    // must be made.
    channelStates[channelName].channel
      .join()
      .receive("ok", updateState)
      .receive("error", (resp) => {
        console.error("Unable to join channel with name " + channelName, resp);
      });
  } else {
    // The channel to join already exists, so the caller should be notified of
    // the current state of the channel immediately! (synchronously)
    stateCallback(channelState.state);
  }

  let callbacksForChannel = channelStates[channelName].callbacks;

  if (!callbacksForChannel.has(stateCallback)) {
    callbacksForChannel.add(stateCallback);
  }
}

export function pushChannel(category, id, message) {
  console.log(
    "Pushing to channel " + getChannelName(category, id) + " | message: ",
    message
  );

  let channelName = getChannelName(category, id);
  channelStates[channelName].channel
    .push("message", message)
    .receive("ok", (resp) => {
      updateState(category, id, resp);
    })
    .receive("error", (resp) => {
      console.error("Unable to push to channel with name " + channelName, resp);
    });
}

export function resetChannel(category, id) {
  console.log("Reseting channel " + getChannelName(category, id));

  let channelName = getChannelName(category, id);
  channelStates[channelName].channel
    .push("reset", {})
    .receive("ok", (resp) => {
      updateState(category, id, resp);
    })
    .receive("error", (resp) => {
      console.error("Unable to reset channel with name " + channelName, resp);
    });
}
