// const players = [
//   {
//     name: "Natalia",
//     score: 12,
//     time: "0:75",
//   },
//   {
//     name: "Helen",
//     score: 53,
//     time: "0:78",
//   },
//   {
//     name: "Fred",
//     score: 11,
//     time: "0:72",
//   },
// ];

export function showLeaderboard() {
  const topPlayers = JSON.parse(localStorage.getItem("players")) || [];

  const tbody = document.querySelector("#leaderboardTable tbody");
  tbody.innerHTML = "";

  topPlayers.forEach((player, index) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="player-index">${index + 1}</td>
      <td class="player-name">${player.name}</td>
      <td class="player-score">${player.score}</td>
      <td class="player-time">${player.time}</td>
    `;
    tbody.appendChild(tr);
  });

  document.getElementById("leaderboardPopup").classList.remove("hidden");
}

document.getElementById("closeLeaderboardBtn").addEventListener("click", () => {
  document.getElementById("leaderboardPopup").classList.add("hidden");
  document.getElementById("gameEndPopup").classList.remove("hidden");
});
