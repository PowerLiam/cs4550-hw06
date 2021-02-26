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

function updateState(category, id, user, state) {
  let channelName = getChannelName(category, id);

  console.log(
    "Updating state for channel " + channelName + " and user " + user,
    state
  );

  channelStates[channelName][user].state = state;
  channelStates[channelName][user].callback(state);
}

export function joinChannel(category, id, user, stateCallback, onError) {
  console.log("Joining channel " + getChannelName(category, id));

  let channelName = getChannelName(category, id);

  // If no user has ever tried to join the channel, initialize the state for it.
  if (channelStates[channelName] === undefined) {
    channelStates[channelName] = {};
  }

  // If this user hasn't joined this channel yet, initialize the state for the user.
  if (channelStates[channelName][user] === undefined) {
    channelStates[channelName][user] = {
      channel: socket.channel(channelName, { user }),
      callback: stateCallback,
      // The user isn't called back with the state until it has been provided
      // from the server.
      state: undefined,
    };
    // Create and join the channel for the user.
    channelStates[channelName][user].channel
      .join()
      .receive("ok", (resp) => {
        updateState(category, id, user, resp);
      })
      .receive("error", (resp) => {
        console.error("Unable to join channel with name " + channelName, resp);
        onError();
      });
    // Set up the newly created channel to receive state pushes from the server.
    channelStates[channelName][user].channel.on("push", (push) =>
      updateState(category, id, user, push)
    );
  } else {
    // The channel to join already exists, so the user is already registered.
    // This is now a no-op.
  }
}

export function pushChannel(category, id, user, type, message) {
  let channelName = getChannelName(category, id);

  console.log(
    "Pushing to channel " + getChannelName(category, id) + " | message: ",
    message,
    channelStates[channelName][user].channel
  );

  channelStates[channelName][user].channel
    .push(type, message)
    .receive("ok", (resp) => {
      updateState(category, id, user, resp);
    })
    .receive("error", (resp) => {
      console.error(
        `Unable to push to channel with name ${channelName}.  Reason: ${resp.reason}`,
        resp
      );
    });
}

export function leaveChannel(category, id, user) {
  let channelName = getChannelName(category, id);

  console.log(
    "Leaving channel " + getChannelName(category, id),
    channelStates[channelName][user].channel
  );

  channelStates[channelName][user].channel
    .leave()
    .receive("ok", () => {
      console.log(`User ${user} successfully left channel ${channelName}.`);
    })
    .receive("error", () => {
      console.log(`User ${user} failed to leave channel ${channelName}.`);
    });
}
