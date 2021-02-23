defmodule Bulls2Web.GameChannel do
  use Bulls2Web, :channel
  require Logger

  alias Bulls2.Game

  @impl true
  def join("game:" <> _id, payload, socket) do
  IO.puts("JOIN")
    if authorized?(payload) do
      IO.puts("CREATING NEW GAME")
      game = Game.new
      IO.puts("CREATED GAME FOR CHANNEL")
      socket = assign(socket, :game, game)
      IO.puts("CREATED SAVED GAME TO SOCKET")
      view = Game.view(game)
      IO.puts("OBTAINED GAME VIEW")
      {:ok, view, socket}
    else
      {:error, %{reason: "unauthorized"}}
    end
  end

  @impl true
  def handle_in("message", %{"guess" => guess}, socket0) do
    IO.puts("MSG")
    game0 = socket0.assigns[:game]
    game1 = Game.guess(game0, guess)
    socket1 = assign(socket0, :game, game1)
    view = Game.view(game1)
    {:reply, {:ok, view}, socket1}
  end

  @impl true
  def handle_in("reset", _, socket) do
    IO.puts("RESET")
    game = Game.new
    socket = assign(socket, :game, game)
    view = Game.view(game)
    {:reply, {:ok, view}, socket}
  end

  # Add authorization logic here as required.
  defp authorized?(_payload) do
    true
  end
end