const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_SHEETS_API_KEY;
const CARD_BANK_ENDPOINT = `https://sheets.googleapis.com/v4/spreadsheets/152qXg1PDREEDsFuyw_SqaKR-AkneCpei8wKh5dkT6oM/values/CardBank?alt=json&key=${API_KEY}`;
const DIFFICULTY_ENDPOINT = `https://sheets.googleapis.com/v4/spreadsheets/152qXg1PDREEDsFuyw_SqaKR-AkneCpei8wKh5dkT6oM/values/Difficulty?alt=json&key=${API_KEY}`;

let seenIndexes = new Set();
let currCards: Array<any> = []; // 3 cards, two displayed, one on deck
let indexPointer: number = 0;
let maxIndex: number = 0;
let cardBank: any[] = [];
let isCardBankLoaded = false;
let range: number = 25;

let cardBankPromise: Promise<any[]> | null = null;

async function fetchCardBank(): Promise<any[]> {
  initializeDifficulty()
  //console.log("Difficulty range:", range);
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

async function fetchDifficulty(): Promise<number> {
  const response = await fetch(DIFFICULTY_ENDPOINT);
  const json = await response.json();
  // Assuming the value is in the first cell of the first row
  const value = json.values?.[0]?.[0];
  return parseInt(value, 10);
}

export async function initializeDifficulty() {
  range = await fetchDifficulty();
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

  var min;
  var max;
  if (cardBank[indexPointer].Price >= 15000) {
    min = Math.max(0, indexPointer - Math.floor(range * 0.4));
    max = Math.min(maxIndex, indexPointer + Math.floor(range * 0.4));
  } else {
    min = Math.max(0, indexPointer - range);
    max = Math.min(maxIndex, indexPointer + range);
  }

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