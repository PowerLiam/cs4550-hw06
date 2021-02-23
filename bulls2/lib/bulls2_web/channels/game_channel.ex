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

      # Save the user info to the socket
      socket = socket
      |> assign(:id, id)      # The ID of the game for this user
      |> assign(:user, user)  # The user name of this user

      # Get the game state from the GenServer process.
      view = id
      |> GameServer.peek()
      |> Game.view()
  
      # Return the view to the user.
      {:ok, view, socket}
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
    view = socket.assigns[:id]
    |> GameServer.guess(user, guess)
    |> Game.view()

    # Return the view to the user.
    {:reply, {:ok, view}, socket}
  end

  # Add authorization logic here as required.
  defp authorized?(_payload) do
    true
  end
end