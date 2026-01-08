import { sentences } from "./main.js";
import { showLeaderboard } from "./leaderBoard.js";
import { database, ref, set, get } from "./firebase.js";

const winnersInDB = ref(database, "winners");

export function showGamePopup({ score, time }) {
  const popup = document.getElementById("gameEndPopup");
  const popupScore = document.getElementById("popupScore");
  const popupTime = document.getElementById("popupTime");

  popupScore.textContent = `${score}`;
  popupTime.textContent = `${time}`;

  popup.classList.remove("hidden");

  checkIfPlayerInTop(score, time).then((isTop) => {
    if (isTop) {
      askPlayerName((name) => savePlayer(name, score, time));
    }
  });

  document.getElementById("popupWinners").addEventListener("click", () => {
    showLeaderboard();
  });

  document.getElementById("showAnswersBtn").onclick = () => {
    showAnswersPopup();
  };

  document.getElementById("restartBtn").onclick = () => {
    location.reload();
  };
}

function askPlayerName(handleName) {
  const nameModal = document.getElementById("nameModal");
  const playerNameInput = document.getElementById("playerNameInput");
  const saveNameBtn = document.getElementById("saveNameBtn");

  nameModal.classList.remove("hidden");
  playerNameInput.focus();

  saveNameBtn.onclick = () => {
    const name = playerNameInput.value.trim() || "Player";
    nameModal.classList.add("hidden");
    handleName(name);
  };
}

async function checkIfPlayerInTop(score, time) {
  const snapshot = await get(winnersInDB);
  const players = snapshot.exists() ? snapshot.val() : [];

  if (players.length < 5) return true;

  const lastPlayer = players[players.length - 1];

  if (score > lastPlayer.score) return true;
  if (score === lastPlayer.score && time < lastPlayer.time) return true;

  return false;
}

async function savePlayer(name, score, time) {
  const player = { name, score, time };

  const snapshot = await get(winnersInDB);
  const players = snapshot.exists() ? snapshot.val() : [];

  players.push(player);

  players.sort((a, b) => {
    if (b.score === a.score) {
      return a.time.localeCompare(b.time);
    }
    return b.score - a.score;
  });

  const topPlayers = players.slice(0, 5);

  await set(winnersInDB, topPlayers);
}

export function showAnswersPopup(nextPopupId = null) {
  const answersPopup = document.getElementById("answersPopup");
  const tbody = document.querySelector("#answersTable tbody");

  tbody.innerHTML = "";

  sentences.forEach((sentence, index) => {
    const row = document.createElement("tr");
    const tdNum = document.createElement("td");
    const tdSentence = document.createElement("td");
    const tdMark = document.createElement("td");

    tdNum.textContent = index + 1;
    tdSentence.textContent = sentence;
    tdMark.textContent = "✔";

    row.appendChild(tdNum);
    row.appendChild(tdSentence);
    row.appendChild(tdMark);
    tbody.appendChild(row);
  });

  answersPopup.classList.remove("hidden");

  document.getElementById("closeAnswersBtn").onclick = () => {
    answersPopup.classList.add("hidden");
    if (nextPopupId) {
      document.getElementById(nextPopupId).classList.remove("hidden");
    }
  };
}
