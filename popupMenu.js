import { showAnswersPopup } from "./gameEnd.js";

export function showPopupMenu({ finishGame }) {
  const popup = document.getElementById("menuPopup");
  const exitMenu = document.getElementById("exitMenu");
  const finishGameMenu = document.getElementById("finishGameMenu");
  const showAnswersMenu = document.getElementById("showAnswersMenu");
  const popupContent = popup.querySelector(".popup-content");

  popup.classList.remove("hidden");

  document.getElementById("restartMenu").onclick = () => {
    location.reload();
  };

  finishGameMenu.addEventListener("click", () => {
    popup.classList.add("hidden");
    finishGame();
  });

  showAnswersMenu.addEventListener("click", () => {
    popup.classList.add("hidden");
    showAnswersPopup("menuPopup");
  });

  exitMenu.addEventListener("click", () => {
    popup.classList.add("hidden");
  });

  popup.addEventListener("click", (e) => {
    if (!popupContent.contains(e.target)) {
      popup.classList.add("hidden");
    }
  });
}
