defmodule Bulls2.GameServer do
  use GenServer

  alias Bulls2.Game
  alias Bulls2.GameSup
  alias Bulls2.BackupAgent

  # ----------------------------- API -------------------------------

  # The name argument in the following methods is the id of a bulls game 
  # which this GenServer process serves.
  def reg(name) do
    {:via, Registry, {Bulls2.GameReg, name}}
  end

  def start(name) do
    spec = %{
      id: __MODULE__,
      start: {__MODULE__, :start_link, [name]},
      restart: :permanent,
      type: :worker
    }
    Bulls2.GameSup.start_child(spec)
  end

  def start_link(name) do
    game = BackupAgent.get(name) || Game.new
    GenServer.start_link(
      __MODULE__,
      game,
      name: reg(name)
    )
  end

  def guess(name, user, guess) do
    GenServer.call(reg(name), {:guess, name, user, guess})
  end

  def peek(name) do
    GenServer.call(reg(name), {:peek, name})
  end

  # ----------------------------- IMPL -------------------------------

  def init(game) do
    # Process.send_after(self(), :pook, 10_000)
    {:ok, game}
  end

  def handle_call({:guess, name, user, guess}, _from, game) do
    game = Game.guess(game, {user, guess})
    BackupAgent.put(name, game)
    {:reply, game, game}
  end

  def handle_call({:peek, _name}, _from, game) do
    {:reply, game, game}
  end

  # Unused for now
  def handle_info(:pook, game) do
    game = Game.guess(game, "q")
    HangmanWeb.Endpoint.broadcast!(
      "game:1", # FIXME: Game name should be in state
      "view",
      Game.view(game, ""))
    {:noreply, game}
  end
end