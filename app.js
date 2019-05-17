/* jslint strict: true */
(function () {
    
    "use strict";
    
    function parseFile(file)
    {
        var cardsWithTotals = file.split("\n");    
        var main = {};
        var sideboard = {};
        var isSideboard = false;
        for (var i = 0; i < cardsWithTotals.length; i++) {
            var cardWithTotal = cardsWithTotals[i].trim();
            if (!cardWithTotal || cardWithTotal == "Sideboard") {
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
        return {main: main, sideboard: sideboard};
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

    function printDeck(main, sideboard)
    {
        return printCards(main) + "\n" + printCards(sideboard);
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
        var output = [];
        var allMain = {};
        var allSideboard = {};
        var handleError = function () {
            // TODO: Handle error on load or when the file is not readable
        };
        var handleReader = function(event) {
            var deck = parseFile(event.target.result);
            if (!deck) {
                handleError(event);
                return;
            }
            allMain = sumCards(allMain, numberedCards(deck.main));
            allSideboard = sumCards(allSideboard, numberedCards(deck.sideboard));
            var main = sortCards(allMain);
            var sideboard = sortCards(allSideboard);
            deck = printDeck(aggregateDeck(main, 60), aggregateDeck(sideboard, 15));
            document.getElementById("aggregated-deck").value = deck.trim();
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
        download("Aggregated Deck.txt", deck);
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

    document.getElementById('decks').addEventListener('change', handleFileSelect, false);
    document.getElementById('download').addEventListener('click', handleDownloadButton, false);
}());
