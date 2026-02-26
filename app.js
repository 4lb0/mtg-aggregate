/* jslint strict: true */
(function () {
    
    "use strict";
    
    function detectFormat(file)
    {
        // Check for Pokemon TCG format indicators
        var pokemonIndicators = ['Pokémon:', 'Trainer:', 'Energy:', 'Pokemon:'];
        for (var i = 0; i < pokemonIndicators.length; i++) {
            if (file.indexOf(pokemonIndicators[i]) !== -1) {
                return 'pokemon';
            }
        }
        return 'mtg';
    }
    
    function parseMtgFile(file)
    {
        var cardsWithTotals = file.split("\n");    
        var main = {};
        var sideboard = {};
        var isSideboard = false;
        for (var i = 0; i < cardsWithTotals.length; i++) {
            var cardWithTotal = cardsWithTotals[i].trim();
            if (!cardWithTotal || cardWithTotal === "Sideboard") {
                isSideboard = true;
                continue;
            }
            var card = cardWithTotal.match(/(\d+)\s+(.*)/);
            if (!card) {
                return false;
            }
            var total = card[1];
            var cardName = card[2];
            if (isSideboard) {
                sideboard[cardName] = parseInt(total);
            } else {
                main[cardName] = parseInt(total);
            }
        }
        return {main: main, sideboard: sideboard, format: 'mtg'};
    }
    
    function parsePokemonFile(file)
    {
        var lines = file.split("\n");
        var pokemon = {};
        var trainer = {};
        var energy = {};
        
        var currentSection = null;
        
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i].trim();
            if (!line) {
                continue;
            }
            
            // Check for section headers
            if (line.match(/^Pok[eé]mon:\s*\d*/i)) {
                currentSection = 'pokemon';
                continue;
            }
            if (line.match(/^Trainer:\s*\d*/i)) {
                currentSection = 'trainer';
                continue;
            }
            if (line.match(/^Energy:\s*\d*/i)) {
                currentSection = 'energy';
                continue;
            }
            
            // Parse card line - format: "4 Mewtwo V PR-SW 107" or "4 Boss's Orders RCL 154"
            var cardMatch = line.match(/^(\d+)\s+(.+)$/);
            if (!cardMatch) {
                continue;
            }
            
            var total = parseInt(cardMatch[1]);
            var cardName = cardMatch[2].trim();
            
            // Store in appropriate section
            if (currentSection === 'pokemon') {
                pokemon[cardName] = (pokemon[cardName] || 0) + total;
            } else if (currentSection === 'trainer') {
                trainer[cardName] = (trainer[cardName] || 0) + total;
            } else if (currentSection === 'energy') {
                energy[cardName] = (energy[cardName] || 0) + total;
            }
        }
        
        return {pokemon: pokemon, trainer: trainer, energy: energy, format: 'pokemon'};
    }

    function parseFile(file)
    {
        var format = detectFormat(file);
        if (format === 'pokemon') {
            return parsePokemonFile(file);
        }
        return parseMtgFile(file);
    }

    function numberedCards(cards)
    {
        var numbered = [];
        for (var card in cards) {
            for (var i = 1; i <= cards[card]; i++) {
                numbered.push(i + " " + card);
            }
        }
        return numbered;
    }

    // Create numbered entries for Pokemon cards, keeping section info
    function numberedPokemonCards(cards, section)
    {
        var numbered = [];
        for (var card in cards) {
            for (var i = 1; i <= cards[card]; i++) {
                numbered.push({key: i + " " + card, name: card, section: section});
            }
        }
        return numbered;
    }

    function sumCards(allCards, deck)
    {    
        for (var i = 0; i < deck.length; i++) {
            var card = deck[i];
            if (!allCards[card]) {
                allCards[card] = 0;
            }
            allCards[card]++;
        }
        return allCards;
    }

    function sortCards(cards)
    {
        var list = [];
        for (var card in cards) {
            var auxCard = card.split(/(\d+) (.*)/);
            list.push({total: cards[card], name: auxCard[2], number: auxCard[1] });
        }
        return list.sort(function (a, b) {
            return b.total - a.total;
        });
    }

    function aggregateDeck(cards, limit)
    {
        var total = 0;
        var deck = {};
        var card;
        for (var i = 0; i < cards.length; i++) {
            card = cards[i].name;        
            if (!deck[card]) {
                deck[card] = 0;
            }
            deck[card]++;
            total++;
            if (total >= limit) {
                break;
            }
        }
        var deckAsArray = [];
        for (card in deck) {
            deckAsArray.push({total: deck[card], card: card});
        }
        return deckAsArray;
    }

    // Sum numbered Pokemon cards across all decks
    function sumPokemonCards(allCards, deck)
    {
        for (var i = 0; i < deck.length; i++) {
            var card = deck[i];
            var key = card.key;
            if (!allCards[key]) {
                allCards[key] = {count: 0, name: card.name, section: card.section};
            }
            allCards[key].count++;
        }
        return allCards;
    }

    function aggregatePokemonDeck(cards)
    {
        // Sort by frequency (count)
        var sorted = [];
        for (var key in cards) {
            sorted.push(cards[key]);
        }
        sorted.sort(function (a, b) {
            return b.count - a.count;
        });
        
        // Take top 60, respecting 4-copy limit per card
        var deck = {pokemon: {}, trainer: {}, energy: {}};
        var total = 0;
        var cardCounts = {};
        
        for (var i = 0; i < sorted.length; i++) {
            var cardName = sorted[i].name;
            var section = sorted[i].section;
            
            if (!cardCounts[cardName]) {
                cardCounts[cardName] = 0;
            }
            
            // Max 4 copies of any card
            if (cardCounts[cardName] >= 4) {
                continue;
            }
            
            if (!deck[section][cardName]) {
                deck[section][cardName] = 0;
            }
            deck[section][cardName]++;
            cardCounts[cardName]++;
            total++;
            
            if (total >= 60) {
                break;
            }
        }
        
        // Convert to sorted arrays
        var result = {
            pokemon: [],
            trainer: [],
            energy: []
        };
        
        for (var card in deck.pokemon) {
            result.pokemon.push({total: deck.pokemon[card], card: card});
        }
        for (card in deck.trainer) {
            result.trainer.push({total: deck.trainer[card], card: card});
        }
        for (card in deck.energy) {
            result.energy.push({total: deck.energy[card], card: card});
        }
        
        // Sort each section by count descending
        result.pokemon.sort(function (a, b) { return b.total - a.total; });
        result.trainer.sort(function (a, b) { return b.total - a.total; });
        result.energy.sort(function (a, b) { return b.total - a.total; });
        
        return result;
    }

    function printDeck(main, sideboard)
    {
        return printCards(main) + "\n" + printCards(sideboard);
    }
    
    function printPokemonDeck(deck)
    {
        var output = "";
        var pokemonTotal = 0;
        var trainerTotal = 0;
        var energyTotal = 0;
        
        for (var i = 0; i < deck.pokemon.length; i++) {
            pokemonTotal += deck.pokemon[i].total;
        }
        for (i = 0; i < deck.trainer.length; i++) {
            trainerTotal += deck.trainer[i].total;
        }
        for (i = 0; i < deck.energy.length; i++) {
            energyTotal += deck.energy[i].total;
        }
        
        output += "Pokémon: " + pokemonTotal + "\n";
        output += printCards(deck.pokemon);
        output += "\nTrainer: " + trainerTotal + "\n";
        output += printCards(deck.trainer);
        output += "\nEnergy: " + energyTotal + "\n";
        output += printCards(deck.energy);
        
        return output;
    }

    function printCards(cards)
    {
        var output = "";
        for (var i = 0; i < cards.length; i++) {
            output += cards[i].total + " " + cards[i].card + "\n";
        }
        return output;
    }

    function handleFileSelect(event)
    {
        var files = event.target.files;
        var allMain = {};
        var allSideboard = {};
        var allPokemonCards = {};
        var detectedFormat = 'mtg';
        
        var handleError = function () {
            // TODO: Handle error on load or when the file is not readable
        };
        
        var filesProcessed = 0;
        var totalFiles = files.length;
        
        var handleReader = function(event) {
            var deck = parseFile(event.target.result);
            if (!deck) {
                handleError(event);
                return;
            }
            
            if (deck.format === 'pokemon') {
                detectedFormat = 'pokemon';
                // Create numbered entries for each deck, then sum frequencies
                var pokemonNumbered = numberedPokemonCards(deck.pokemon, 'pokemon');
                var trainerNumbered = numberedPokemonCards(deck.trainer, 'trainer');
                var energyNumbered = numberedPokemonCards(deck.energy, 'energy');
                
                allPokemonCards = sumPokemonCards(allPokemonCards, pokemonNumbered);
                allPokemonCards = sumPokemonCards(allPokemonCards, trainerNumbered);
                allPokemonCards = sumPokemonCards(allPokemonCards, energyNumbered);
            } else {
                allMain = sumCards(allMain, numberedCards(deck.main));
                allSideboard = sumCards(allSideboard, numberedCards(deck.sideboard));
            }
            
            filesProcessed++;
            
            // Only update output after all files are processed
            if (filesProcessed === totalFiles) {
                if (detectedFormat === 'pokemon') {
                    var aggregated = aggregatePokemonDeck(allPokemonCards);
                    deck = printPokemonDeck(aggregated).trim();
                } else {
                    var main = sortCards(allMain);
                    var sideboard = sortCards(allSideboard);
                    deck = printDeck(aggregateDeck(main, 60), aggregateDeck(sideboard, 15)).trim();
                }
                document.getElementById("aggregated-deck").value = deck;
            }
        };
 
        for (var i = 0; i < files.length; i++) {
            var file = files[i];
            var reader = new FileReader();
            reader.onload = handleReader;
            reader.onerror = handleError; 
            reader.readAsText(file);
        }
    }

    function handleDownloadButton()
    {
        var deck = document.getElementById("aggregated-deck").value;
        var filename = "Aggregated Deck.txt";
        download(filename, deck);
    }

    function download(filename, text)
    {
        var element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
        element.setAttribute('download', filename);
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    }

    var supportsMultipleFiles = 'multiple' in document.createElement('input');
    if (supportsMultipleFiles && window.FileReader) {
        document.getElementById('decks').addEventListener('change', handleFileSelect, false);
        document.getElementById('download').addEventListener('click', handleDownloadButton, false);
    } else {
        window.alert("Sorry, this browser is not supported");
    }
}());
