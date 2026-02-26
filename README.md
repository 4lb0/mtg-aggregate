# [MTG & Pokémon TCG Aggregate](https://4lb0.github.io/mtg-aggregate/)

An app to generate an average deck list from an archetype.

Supports both **Magic: The Gathering** and **Pokémon TCG** formats.

## What is this?

This is a way to generate an average deck list from an archetype by using the algorithm described by Frank Karsten in his article [A New Way to Determine an Aggregate Deck List](https://web.archive.org/web/20201111223914/https://www.channelfireball.com/articles/magic-math-a-new-way-to-determine-an-aggregate-deck-list-rg-dragons/).

## How to use

### Magic: The Gathering

First go to a site like [MTG Goldfish](http://mtggoldfish.com/) to download all the decks you want to merge.

![Download decks](https://raw.githubusercontent.com/4lb0/mtg-aggregate/master/download-decks.gif)

Then upload the lists and that's it.

![Use app](https://raw.githubusercontent.com/4lb0/mtg-aggregate/master/use-app.gif)

### Pokémon TCG

Upload multiple Pokémon TCG deck files (in standard format with Pokémon:, Trainer:, and Energy: sections). The app will automatically detect the format and aggregate cards within each section.

Example input:
```
Pokémon: 20
4 Dreepy TWM 128
4 Drakloak TWM 129
3 Dragapult ex TWM 130

Trainer: 31
4 Lillie's Determination MEG 119
3 Boss's Orders MEG 114

Energy: 9
4 Psychic Energy MEE 5
```

Go to the [app](https://4lb0.github.io/mtg-aggregate/)

## FAQ

* Is Arena supported?

  Not yet. Right now you can upload the file to another site and then exported to Arena.

* Is Pokémon TCG Live supported?

  The app supports standard Pokémon TCG deck list format. Export your decks in text format and upload them.

* Why the app is so ugly?

  I want to make a fast site and also I am not a designer.

* Is this sponsored by [Cardhoarder](https://www.cardhoarder.com/r/57f887e939c90)?

  No, I just add my referral code. 
