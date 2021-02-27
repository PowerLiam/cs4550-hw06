# Bulls2

## Design Decisions:
### Duplicate Guess Checking:
Chose NOT to integrate duplicate guess checking from single player 4digits, as since there's hypothetically any number of guesses, it could be very hard eventually to generate a guess that would be accepted
### Status Codes:
Socket communication between the server and the client does not transmit solely a new gamestate, but also some additional metadata regarding things like whether or not you succeeded as expected on your action
### Leaving game:
Leaving a game makes a user leave the elixir channel entirely and return to the sign in page. They can rejoin the game if they input the same game and username.
