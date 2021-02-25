defmodule Bulls2.Game do

  # ----------------------------- API -------------------------------

  def new do
    %{
      secret: random_secret([]),
      users: %{},
      game: 1,
      setup: true,
      rounds: [],
    }
  end

  def join(st, user) do
    # Need to include success status so that we can stop the user from joining
    # the elixir channel.  This is important if two different users try to join
    # a game with the same name.
    cond do
      Map.has_key?(st.users, user) ->
        {st, false}
      st.setup ->
        %{st | users: Map.put_new(st.users, user, new_user("player"))}
        {st, true}
      true ->
        %{st | users: Map.put_new(st.users, user, new_user("observer"))}
        {st, true}
    end
  end

  def become_observer(st, user) do
    if Map.has_key?(st.users, user) and st.setup do
      %{st.users[user] | role: "observer"}
    else
      st
    end
  end

  def become_player(st, user) do
    if Map.has_key?(st.users, user) and st.setup do
      %{st.users[user] | role: "player"}
    else
      st
    end
  end

  def ready(st, {user, ready?}) do
    if Map.has_key?(st.users, user) and st.setup do
      %{st.users[user] | ready: "ready"}
    end

    # If this ready makes it such that all players are ready, initiate the game.
    if all_players_ready(st) do
      %{
        secret: st.secret,
        users: st.users,
        game: st.game,
        setup: false,
        rounds: [%{}],
      }
    else
      st
    end
  end

  def auto_pass(st) do
    Enum.reduce(
      get_player_names(st), st
      fn(name, acc) ->
        guess(acc, {name, "pass"})
      end)
  end


  def guess(st, {user, guess}) do
    {valid_guess, _} = validate_guess(guess)

    if !st.setup and valid_guess and !guessed_in_current_round(user) do
      # 1) Blindly add the guess to the current round.
      # 2) Check if the current round is complete.
      #       If so, check for winners, if they exist, move to setup mode
      #       If not, add the new empty map for the next round and continue
      current_round = get_current_round(st)

      if !Map.has_key?(current_round, user) do
        current_round = Map.put(current_round, user, make_guess_info(secret, guess))
      end

      updated_rounds = get_previous_rounds(st) ++ [current_round]

      if is_round_complete(current_round) do
        winners = get_winner_names(current_round)
        if Enum.count(winners) > 0 do
          # Move to setup phase
          %{
            secret: random_secret([]),
            users: add_winners(winners, st.users, st.game),
            game: st.game + 1,
            setup: true,
            rounds: [],
          }
        else
          # Prepare next round for play
          %{st | rounds: updated_rounds ++ [%{}]}
        end
      else
        # Continue with current round
        %{st | rounds: updated_rounds}
      end
    else
      st
    end
  end

  # The view has exactly 2 differences from the server side state:
  #    1. The secret is not included in the view.
  #    2. A round is not included in the view until all players have
  #       guessed or passed.
  def view(st) do
    secret = st.secret
    completed_rounds = st.rounds

    # If the current round is not complete, omit it from the view
    if !current_round_complete(st) do
      completed_rounds = get_previous_rounds(st)
    end

    %{
      users: st.users,
      game: st.game,
      setup: st.setup,
      rounds: completed_rounds,
    }
  end

  # ----------------------------- IMPL -------------------------------

  def new_user(role) do
    %{
      ready: false,
      role: role,
      won: []
    }
  end

  def get_winner_names(round) do
    round
    |> Map.to_list()
    |> Enum.filter(
      fn ({name, guess_info}) ->
        guess_info.bulls === 4
      end
    )
    |> Enum.map(
      fn ({name, guess_info}) ->
        name
      end
    )
  end

  def get_player_names(st) do
    st.users
    |> Map.to_list()
    |> Enum.filter(
      fn ({name, data}) ->
        data.role == "player"
      end
    )
    |> Enum.map(
      fn ({name, data}) ->
        name
      end
    )
  end

  def all_players_ready?(st) do
    st.users
    |> Map.to_list()
    |> Enum.filter(
      fn ({name, data}) ->
        data.role == "player"
      end
    )
    |> Enum.reduce(
      true,
      fn ({name, data}, acc) ->
        acc && data.ready
      end
    )
  end

  def round_complete(st, round) do
    players = get_player_names(st)
    players_with_guess = Map.keys(round)
    Enum.count(players_with_guess) === Enum.count(players)
  end

  def current_round_complete?(st) do
    players = get_player_names(st)
    players_with_guess = Map.keys(get_current_round(st))
    Enum.count(players_with_guess) === Enum.count(players)
  end

  def get_current_round(st) do
    Enum.at(rounds, Enum.count(st.rounds) - 1)
  end

  def get_previous_rounds(st) do
    List.delete_at(st.rounds, Enum.count(st.rounds) - 1)
  end

  def guessed_in_current_round?(st, user) do
    Map.has_key?(get_current_round(st), user)
  end

  def add_winners(winners, users, game_number) do
    winner_set = MapSet.new(winners)
    Enum.map(
      users,
      fn ({user, user_info}) ->
        if MapSet.member?(winner_set, user) do
          {
            user, 
             %{
              ready: user_info.ready,
              role: user_info.role,
              won: user_info.won ++ [game_number]
            }
          }
        else 
          {user, user_info}
        end
      end
    )
  end

  def make_guess_info(secret, guess) do
    if guess == "pass" do
      %{
        guess: guess,
        cows: 0,
        bulls: 0
      }
    else
      %{
        guess: guess,
        cows: cow_count(secret, guess),
        bulls: bull_count(secret, guess)
      }
    end
  end

  def validate_guess(guess) do
    cond do
      guess == "pass" ->
        {true, ""}
      String.length(guess) != 4 ->
        {false, "guess wasn't 4 digits"}
      true ->
        {_, unique} = 
          Enum.reduce(String.graphemes(guess), 
            {MapSet.new(), true}, 
            fn (digit, {digitsSeen, result}) ->
              updatedDigitsSeen = MapSet.put(digitsSeen, digit)
              if MapSet.member?(digitsSeen, digit) do
                {updatedDigitsSeen, false}
              else
                {updatedDigitsSeen, result && true}
              end
            end)

        if unique do
          {true, ""}
        else
          {false, "guess contained duplicate digits"}
        end
    end
  end

  def cow_count(secret, guess) do
    digitList = String.graphemes(guess)
    secretList = String.graphemes(secret)
    secretSet = MapSet.new(String.graphemes(secret))

    Enum.reduce(Enum.with_index(digitList), 0, fn ({digit, index}, acc) ->
        if digit != Enum.at(secretList, index) and MapSet.member?(secretSet, digit) do
          acc + 1
        else
          acc
        end
    end)
  end

  def bull_count(secret, guess) do
    digitList = String.graphemes(guess)
    secretList = String.graphemes(secret)

    Enum.reduce(Enum.with_index(digitList), 0, fn ({digit, index}, acc) ->
        if digit == Enum.at(secretList, index) do
          acc + 1
        else
          acc
        end
    end)
  end

  def random_secret(digits) do
    if (Enum.count(digits) == 4) do
      Enum.join(digits, "")
    else
      digit = Enum.random([1,2,3,4,5,6,7,8,9])
      if !MapSet.member?(MapSet.new(digits), digit) do
        random_secret(digits ++ [digit])
      else
        random_secret(digits)
      end
    end
  end
end