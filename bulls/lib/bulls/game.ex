defmodule Bulls.Game do

  def new do
    %{
      secret: random_secret([]),
      guesses: MapSet.new(),
    }
  end

  def guess(st, guess) do
    if validate_guess(guess, MapSet.new()) do
      %{ st | guesses: MapSet.put(st.guesses, guess) }
    else
      st
    end
  end

  def view(st) do
    secret = st[:secret]
    %{
      guesses: Enum.map(MapSet.to_list(st.guesses), fn (guess) -> 
        %{
          guess: guess,
          cows: cow_count(secret, guess),
          bulls: bull_count(secret, guess)
        }
      end),
    }
  end

  def random_secret(digits) do
    if (Enum.count(digits) == 4) do
      Enum.join(digits, "")
    end

    digit = Enum.random([1,2,3,4,5,6,7,8,9])
    if !MapSet.member?(MapSet.new(digits), digit) do
      random_secret(digits ++ digit)
    else
      random_secret(digits)
    end
  end

  def validate_guess(guess, digitSet) do
    guessLen = String.length(guess)
    cond do
      guessLen == 0 ->
        true
      MapSet.member?(digitSet, String.first(guess)) ->
        false
      true ->
        validate_guess(
          String.slice(guess, 1, guessLen),
          MapSet.put(digitSet, String.first(guess)))
    end
  end

  def cow_count(secret, guess) do
    digitList = String.graphemes(guess)
    secretList = String.graphemes(secret)
    secretSet = MapSet.new(String.graphemes(secret))

    Enum.reduce(Enum.with_index(digitList), 0, fn ({digit, index}, acc) ->
        if digit != secretList[index] and MapSet.member?(secretSet, digit) do
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
        if digit == secretList[index] do
          acc + 1
        else
          acc
        end
    end)
  end

end