import data from "../../data/card-bank.json";

export default function getCards() {
  let cardArray: Array<any> = [...data];
  //cardArray.sort(() => Math.random() - 0.5); // shuffle order of cards

  // Fisher-Yates shuffle
  for (let i = cardArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cardArray[i], cardArray[j]] = [cardArray[j], cardArray[i]];
  }

  while (cardArray[0]["Price"] == cardArray[1]["Price"]) {
    cardArray.splice(0, 1);
  }

  return cardArray;
}
