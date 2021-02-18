defmodule Bulls.Game do

  def new do
    %{
      secret: random_secret([]),
      guesses: [],
    }
  end

  def guess(st, guess) do
    {valid_guess, _} = validate_guess(guess, MapSet.new(st.guesses))
    cond do
      won(st) ->
        st
      valid_guess ->
        %{ st | guesses: st.guesses ++ [guess] }
      true
        st
    end
  end

  def view(st) do
    secret = st[:secret]
    %{
      guesses: Enum.map(st.guesses, fn (guess) -> 
        %{
          guess: guess,
          cows: cow_count(secret, guess),
          bulls: bull_count(secret, guess)
        }
      end),
    }
  end

  def random_secret(digits) do
    IO.inspect(digits)
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

  def won(st) do
    Enum.reduce(st.guesses, 
      false, 
      fn (guess, acc) ->
        acc || (bull_count(st.secret, guess) == 4)
      end)
  end

  def validate_guess(guess, guesses) do
    cond do
      Enum.count(guesses) >= 8 ->
        {false, "already guessed 8 times"}
      MapSet.member?(guesses, guess) ->
        {false, "duplicate guess"}
      String.length(guess) != 4 ->
        {false, "guess wasn't 4 digits"}
      true ->
        {_, unique} = 
          Enum.reduce(Enum.with_index(String.graphemes(guess)), 
            {MapSet.new(), true}, 
            fn ({digit, index}, {digitsSeen, result}) ->
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

end