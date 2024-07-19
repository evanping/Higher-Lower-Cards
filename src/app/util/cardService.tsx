import data from '../../data/card-bank.json'

export default function getCards() {
    let cardArray : Array<any> = [ ...data ]
    cardArray.sort(() => Math.random() - 0.5); // shuffle order of cards

    let allCards: Array<any> = []
    while (cardArray.length >= 2) {
        allCards.push(cardArray.splice(0, 2)) // inserts cards in pairs
    }

    return allCards;
}