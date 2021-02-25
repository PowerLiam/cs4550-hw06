defmodule Bulls2.GameServer do
  use GenServer

  alias Bulls2.Game
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

  # Leave?  (Potential improvement)

  def join(name, user) do
    GenServer.call(reg(name), {:join, name, user})
  end

  def become_observer(name, user) do
    GenServer.call(reg(name), {:become_observer, name, user})
  end

  def become_player(name, user) do
    GenServer.call(reg(name), {:become_player, name, user})
  end

   def ready(name, user, ready?) do
    GenServer.call(reg(name), {:ready, name, user, ready?})
  end

  def guess(name, user, guess) do
    GenServer.call(reg(name), {:guess, name, user, guess})
  end

  def peek(name) do
    GenServer.call(reg(name), {:peek, name})
  end

  # ----------------------------- IMPL -------------------------------

  def init(game) do
    {:ok, game}
  end

  def handle_call({:join, name, user}, _from, game) do
    {game, success} = Game.join(game, user)
    if success do
      broadcast_state(name, game)
    end
    {:reply, {game, success}, game}
  end

  def handle_call({:become_observer, name, user}, _from, game) do
    game = Game.become_observer(game, user)
    broadcast_state(name, game)
    {:reply, game, game}
  end

  def handle_call({:become_player, name, user}, _from, game) do
    game = Game.become_player(game, user)
    broadcast_state(name, game)
    {:reply, game, game}
  end

  def handle_call({:ready, name, user}, _from, game) do
    game = Game.ready(game, user)
    broadcast_state(name, game)
    {:reply, game, game}
  end

  def handle_call({:guess, name, user, guess}, _from, game) do
    game = Game.guess(game, {user, guess})
    BackupAgent.put(name, game)
    broadcast_state(name, game)
    {:reply, game, game}
  end

  def handle_call({:peek, _name}, _from, game) do
    {:reply, game, game}
  end

  # Unused for now
  def handle_info({:pass_round, name}, game) do
    # Process.send_after(self(), {:pass_round, name}, 10_000)
    game = Game.guess(game, "q")
    Bulls2.Endpoint.broadcast!(
      "game:#{name}",
      "push",
      Game.view(game))
    {:noreply, game}
  end

  def broadcast_state(name, game) do
    Bulls2.Endpoint.broadcast!(
      "game:#{name}",
      "push",
      Game.view(game))
  end
end