import { database, ref, get } from "./firebase.js";

export async function showLeaderboard() {
  const winnersInDB = ref(database, "winners");

  const tbody = document.querySelector("#leaderboardTable tbody");

  tbody.innerHTML = "";

  const snapshot = await get(winnersInDB);
  const topPlayers = snapshot.exists() ? snapshot.val() : [];

  topPlayers.forEach((player, index) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
          <td class="player-index">${index + 1}</td>
          <td class="player-name">${player.name}</td>
          <td class="player-score">${player.score}</td>
          <td class="player-time">${player.time}</td>`;
    tbody.appendChild(tr);
  });
  document.getElementById("leaderboardPopup").classList.remove("hidden");
}

document.getElementById("closeLeaderboardBtn").addEventListener("click", () => {
  document.getElementById("leaderboardPopup").classList.add("hidden");
  document.getElementById("gameEndPopup").classList.remove("hidden");
});
