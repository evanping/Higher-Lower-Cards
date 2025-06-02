const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_SHEETS_API_KEY;
const CARD_BANK_ENDPOINT = `https://sheets.googleapis.com/v4/spreadsheets/16E1Yx61YJd01RNNj7KOvOxh9jxdvfBW0or-udNdFQak/values/Sheet1?alt=json&key=${API_KEY}`;

let seenIndexes = new Set();
let currCards: Array<any> = []; // 3 cards, two displayed, one on deck
let indexPointer: number = 0;
let maxIndex: number = 0;
let cardBank: any[] = [];
let isCardBankLoaded = false;

let cardBankPromise: Promise<any[]> | null = null;

async function fetchCardBank(): Promise<any[]> {
  const response = await fetch(CARD_BANK_ENDPOINT);
  const json = await response.json();
  const [headers, ...rows] = json.values;
  return rows.map((row: any[]) => {
    const card: any = {};
    headers.forEach((header : string, i: number) => {
      if (header === "Price" || header === "Id") {
        card[header] = parseInt(row[i], 10);
      } else {
        card[header] = row[i];
      }
    });
    return card;
  });
}

export async function initializeCardBank() {
  if (!cardBankPromise) {
    cardBankPromise = fetchCardBank();
  }
  if (!isCardBankLoaded) {
    cardBank = await cardBankPromise;
    indexPointer = Math.floor(Math.random() * cardBank.length);
    seenIndexes.add(indexPointer);
    maxIndex = cardBank.length - 1;
    isCardBankLoaded = true;
  }
}

export function isCardBankReady(){
  return isCardBankLoaded;
}

export function getCards() {
  if (!isCardBankLoaded) {
    throw new Error("Card bank is not initialized. Call initializeCardBank() first.");
  }

  if (currCards.length < 3) {
    while (currCards.length < 3) {
      indexPointer = getNextIndex();
      currCards.push(cardBank[indexPointer]);
    }
  } else {
    // Remove the first card and add a new one
    currCards.shift();
    indexPointer = getNextIndex();
    currCards.push(cardBank[indexPointer]);
  }
  //console.log("Current cards:", currCards);           // Debugging line to see current cards
  return [...currCards];
}

 function getNextIndex() {
  if (!isCardBankLoaded) {
    throw new Error("Card bank is not initialized. Call initializeCardBank() first.");
  }

  const min = Math.max(0, indexPointer - 25);
  const max = Math.min(maxIndex, indexPointer + 25);
  // Pick a random index in [min, max], excluding same price cards

  if (seenIndexes.size === cardBank.length - 1) {
    seenIndexes.clear();
  }

  let nextIndex = indexPointer;
  while (cardBank[indexPointer].Price === cardBank[nextIndex].Price || seenIndexes.has(nextIndex)) {
    nextIndex = Math.floor(Math.random() * (max - min + 1)) + min;
  }
  seenIndexes.add(nextIndex);
  return nextIndex;
}