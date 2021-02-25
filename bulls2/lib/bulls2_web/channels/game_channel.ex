defmodule Bulls2Web.GameChannel do
  use Bulls2Web, :channel
  require Logger

  alias Bulls2.Game
  alias Bulls2.GameServer

  @impl true
  def join("game:" <> id, %{"user" => user}, socket) do
    if authorized?(user) do
      IO.puts("User #{user} joined game #{id}")
      # Starts a GenServer process to serve the game with name 'id' if one does not
      # already exist.
      GameServer.start(id)

      # Save the user info to the socket.
      socket = socket
      |> assign(:id, id)      # The ID of the game for this user
      |> assign(:user, user)  # The user name of this user

      # Attempt to join the game for the user.
      {game, success} = GameServer.join(id, user)

      if success do
        # Return the view to the user.
        {:ok, Game.view(game), socket}
      else
        # Return an error to the user, ensuring that they don't join this channel
        {:error, %{reason: "couldn't join game #{id}"}}
      end
    else
      {:error, %{reason: "unauthorized"}}
    end
  end

  @impl true
  def handle_in("guess", %{"guess" => guess}, socket) do
    # Get the user and game ID for this socket.
    user = socket.assigns[:user]
    IO.puts("User #{user} guessed #{guess} in game #{socket.assigns[:id]}")

    # Make the guess, mutating the game, then obtain a view.

    {success, reason, game} = socket.assigns[:id]
    |> GameServer.guess(user, guess)

    if success do
      # Return the view to the user.
      {:reply, {:ok, Game.view(game)}, socket}
    else
      # Return an error to the user.
      {:reply, {:error, %{reason: reason}}, socket}
    end
  end

  @impl true
  def handle_in("become_observer", _payload, socket) do
    # Get the user and game ID for this socket.
    user = socket.assigns[:user]
    IO.puts("User #{user} tried to become observer in game #{socket.assigns[:id]}")

    # Attempt to become observer, then obtain a view.
    view = socket.assigns[:id]
    |> GameServer.become_observer(user)
    |> Game.view()

    # Return the view to the user.
    {:reply, {:ok, view}, socket}
  end

  @impl true
  def handle_in("become_player", _payload, socket) do
    # Get the user and game ID for this socket.
    user = socket.assigns[:user]
    IO.puts("User #{user} tried to become player in game #{socket.assigns[:id]}")

    # Attempt to become player, then obtain a view.
    view = socket.assigns[:id]
    |> GameServer.become_player(user)
    |> Game.view()

    # Return the view to the user.
    {:reply, {:ok, view}, socket}
  end

  @impl true
  def handle_in("ready", %{"ready" => ready?}, socket) do
    # Get the user and game ID for this socket.
    user = socket.assigns[:user]
    IO.puts("User #{user} tried to change ready status to #{ready?} in game #{socket.assigns[:id]}")

    # Attempt to ready up, then obtain a view.
    view = socket.assigns[:id]
    |> GameServer.ready(user, ready?)
    |> Game.view()

    # Return the view to the user.
    {:reply, {:ok, view}, socket}
  end

  # Add authorization logic here as required.
  defp authorized?(_payload) do
    true
  end
end