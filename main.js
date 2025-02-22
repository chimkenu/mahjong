// MAHJONG GAME
// main.js
//
// written by chimkenu
// started 02/21/2025
//
// game logic for the entire mahjong game!

import "./style.css";
import { resources } from "./src/Resources.js";
import * as readline from "node:readline";
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// CONSTANTS
const MAX_PLAYERS = 4;
const REAL_PLAYERS = [0];
const NUMBERED_CARDS = ['S', 'B', 'C'];
const NAMED_CARDS = ['N', 'S', 'E', 'W', 'W', 'G', 'R'];
const STARTING_HAND = 16;
const WINNING_HANDS = [
  { // STANDARD WIN - 5 sets of 3 and 1 pair
    sets: 5,
    pairs: 1
  },
  { // LUCKY WIN - 7 pairs and 1 set of 3
    sets: 1,
    pairs: 7
  }
];

// CANVAS
const canvas = document.querySelector("#game-canvas");
const ctx = canvas.getContext("2d");

const dwaw = () => {
  const background = resources.images.background;
  if (background.isLoaded) {
    ctx.drawImage(background.image, 0, 0);
  }
};
dwaw();

// GAME LOOP
runGame();
async function runGame() {
  const game = setup();
  let playerIndex = 0;
  draw(game, playerIndex);
  while (true) {
    console.log(`PLAYER ${playerIndex + 1}'s TURN:`);

    // fake thinking if its not a real player
    if (!REAL_PLAYERS.includes(playerIndex)) {
      console.log(`player ${playerIndex + 1} is thinking...`);
      await sleep(2000);
    }

    let currentHand = game.players[playerIndex];
    currentHand.sort();
    console.log(`hand: ${currentHand}`);
    if (checkWin(currentHand)) {
      break;
    }

    let discard = await decide(game, playerIndex);
    // remove discard from player
    currentHand = setSubtract(currentHand, [discard]);
    console.log(`PLAYER ${playerIndex + 1} DISCARDED: ${discard}`);

    // let other players pong!
    // result is the new player index (if they pong'd)
    let result = await pong(game, discard, playerIndex);
    if (result >= 0) {
      playerIndex = result;
      game.players[playerIndex].push(discard);
    } else {
      game.table.push(discard);
      playerIndex++;
      playerIndex %= MAX_PLAYERS;
      draw(game, playerIndex);
    }
  }

  console.log(`Player ${playerIndex + 1} won!`);
  rl.close();
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// GAME FUNCTIONS
function setup() {
  let game = {
    deck: shuffle(),
    table: [],
    players: []
  }

  for (let i = 0; i < MAX_PLAYERS; i++) {
    for (let j = 0; j < STARTING_HAND; j++) {
      draw(game, i);
    }
  }

  return game;
}

function shuffle() {
  deck = [];
  for (const c of NUMBERED_CARDS) {
    for (let i = 1; i <= 9; i++) {
      for (let j = 0; j < 4; j++) {
        deck.push(c + i);
      }
    }
  }
  for (const c of NAMED_CARDS) {
    for (let i = 1; i <= 4; i++) {
      deck.push(c);
    }
  }

  for (let i = deck.length - 1; i >= 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    let temp = deck[i];
    deck[i] = deck[j];
    deck[j] = temp;
  }

  return deck;
}

function draw(game, player) {
  if (game.players[player] == null) {
    game.players[player] = [];
  }
  game.players[player].push(game.deck.pop());
  console.log(`drew a ${game.players[player].at(-1)}`);
}

function decide(game, player) {
  let hand = game.players[player];
  if (REAL_PLAYERS.includes(player)) {
    return new Promise(resolve =>
      rl.question("What will you discard? ", discard => {
        if (!hand.includes(discard)) {
          console.log(`${discard} doesn't exist, dumbass. i'm gonna pick for you.`);
          resolve(hand[0]);
        }
        resolve(discard);
      })
    );
  }
  return hand[0];
}

function pong(game, discard, discarder) {
  let pongers = [];
  for (let i = 0; i < MAX_PLAYERS; i++) {
    if (i == discarder) {
      continue;
    }
    if (isAllowedToPong(game.players[i], discard)) {
      pongers.push(i);
    }
  }

  console.log(`pongers: ${pongers}`);
  if (pongers.length < 1) {
    return;
  }

  return new Promise(resolve =>
    rl.question("Who would like to pong? ", player => {
      player--; // this is because we are 0-indexed, so shift by 1
      if (player < 0) {
        console.log("silence...");
        resolve(-1);
        return;
      }
      if (!pongers.includes(Number(player))) {
        console.log(`silly player ${player + 1}, you can't pong that!`);
        resolve(-1);
        return;
      }
      console.log(`PLAYER ${player + 1} PONGED ${discard}!`);
      resolve(player);
    })
  );
}

function isAllowedToPong(playerHand, discard, victimIndex, pongerIndex) {
  let newHand = Array.from(playerHand);
  newHand.push(discard);
  if (checkWin(newHand)) {
    // mahjong!
    return true;
  }

  // check if playerHand has pair of the discard, return "pong!"
  for (const pair of countPairs(playerHand)) {
    if (pair[0] == discard) {
      // triplet
      return true;
    }
  }

  // check if newHand has sequence with discard, only if the ponger comes after
  victimIndex = (victimIndex + 1) % 4;
  if (pongerIndex == victimIndex) {
    for (const set of countSequences(newHand)) {
      if (set.includes(discard)) {
        // sequence
        return true;
      }
    }
  }

  return false;
}

// backtracking
function checkWin(hand, accepted) {
  if (accepted == null) {
    accepted = [];
  }

  // base case: hand is empty, assume its a win
  if (hand.length == 0) {
    return true;
  }

  let candidates = checkWinCandidates(hand);
  for (const candidate of candidates) {
    if (!isWinFeasible(accepted, candidate)) {
      continue;
    }

    // accept candidate, remove it from the hand
    accepted.push(candidate);
    hand = setSubtract(hand, candidate);

    // recursive call
    if (checkWin(hand, accepted)) {
      return true; // well, i guess we're done
    }

    // reject candidate, put it back in the hand
    for (const c of accepted.pop()) {
      hand.push(c);
    }
  }
  // no win exists.
  return false;
}

function checkWinCandidates(hand) {
  let candidates = [];
  candidates = candidates.concat(countPairs(hand));
  candidates = candidates.concat(countTriplets(hand));
  candidates = candidates.concat(countSequences(hand));
  return candidates;
}

function isWinFeasible(accepted, candidate) {
  let sets = 0;
  let pairs = 0;
  for (const a of accepted) {
    if (a.length == 3) {
      sets++;
    } else {
      pairs++;
    }
  }
  if (candidate.length == 3) {
    sets++;
  } else {
    pairs++;
  }

  for (const win of WINNING_HANDS) {
    if (sets <= win.sets && pairs <= win.pairs) {
      return true;
    }
  }
  return false;
}

function setSubtract(A, B) {
  for (const b of B) {
    const i = A.indexOf(b);
    if (i > -1) {
      A.splice(i, 1);
    }
  }
  return A;
}

function countTriplets(hand) {
  counter = {};
  for (const c of hand) {
    if (counter[c] == null) {
      counter[c] = 0;
    }
    counter[c]++;
  }
  let triplets = [];
  for (const [k, v] of Object.entries(counter)) {
    if (v >= 3) {
      triplets.push([k, k, k]);
    }
  }
  return triplets;
}

function countSequences(hand) {
  counter = {};
  for (const c of hand) {
    if (!isNumbered(c)) {
      continue;
    }
    let n = getNumber(c);
    if (counter[n] == null) {
      counter[n] = {};
      for (const type of NUMBERED_CARDS) {
        counter[n][type] = 0;
      }
    }
    counter[n][getNumberType(c)]++;
  }
  let sequences = [];
  for (let i = 1; i <= 7; i++) {
    for (const c of NUMBERED_CARDS) {
      let possible = true;
      for (let j = 0; j < 3; j++) {
        if (counter[i + j] == null) {
          possible = false;
        }
        possible = possible && counter[i + j][c] > 0;
      }
      if (possible) {
        sequences.push([c + i, c + (i + 1), c + (i + 2)]);
      }
    }
  }
  return sequences;
}

function countPairs(hand) {
  counter = {};
  for (const c of hand) {
    if (counter[c] == null) {
      counter[c] = 0;
    }
    counter[c]++;
  }
  let pairs = [];
  for (const [k, v] of Object.entries(counter)) {
    for (let i = 0; i < (v - (v % 2)) / 2; i++) {
      pairs.push([k, k]);
    }
  }
  return pairs;
}

function isNumbered(card) {
  return ("" + card).length == 2;
}

function getNumber(card) {
  if (isNumbered(card)) {
    return Number(card[1]);
  }
  console.log("ERROR: getNumber called on non-numbered card: " + card);
}

function getNumberType(card) {
  if (isNumbered(card)) {
    return card[0];
  }
  console.log("ERROR: getNumberType called on non-numbered card: " + card);
}

// 'AI'-opponent FUNCTIONS
function computerDecide(hand) {
  // TODO fix this stupid ass decision
  return hand[0];
}

