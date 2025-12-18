import { showGamePopup } from "./gameEnd.js";

export const sentences = [
  "It was raining all day yesterday",
  // "I was reading a book at 9 pm last night",
  // "They were having dinner when the phone rang",
  // "While I was studying, my friends were watching TV",
  "She was driving home when I saw her",
  // "We were watching the sunset at 6 pm",
  // "He was working on his diploma for several months",
  // "This time last year, I was living in Paris",
  // "The sun was shining and we were walking in the park",
  // "When I came home, my brother was sleeping",
];

let shuffledSentences = [];
let correctOrders = [];

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function createShuffledSentences(arr) {
  arr.forEach((sentence) => {
    const words = sentence.split(" ");
    correctOrders.push(words);
    const wordsCopy = [...words];
    const shuffledWords = shuffle(wordsCopy);
    const shuffledSentence = shuffledWords.join(" ");
    shuffledSentences.push(shuffledSentence);
  });
  return shuffledSentences;
}

createShuffledSentences(sentences);

// Init HTML content of slider

const swiperWrapper = document.querySelector(".swiper-wrapper");

const totalSlides = shuffledSentences.length;

function fillSlides(arr) {
  arr.forEach((sentence, sentenceIndex) => {
    const div = document.createElement("div");
    div.classList.add("swiper-slide");
    const p = document.createElement("div");
    p.classList.add("items");
    p.setAttribute("data-sentence", sentenceIndex);

    const words = sentence.split(" ");
    words.forEach((word, wordIndex) => {
      const span = document.createElement("span");

      span.setAttribute("data-word", wordIndex);
      span.classList.add("element");
      span.setAttribute("draggable", true);

      const spanInner = document.createElement("span");
      spanInner.classList.add("element-inner");
      spanInner.textContent = word;
      span.appendChild(spanInner);
      p.appendChild(span);
    });

    div.appendChild(p);
    swiperWrapper.appendChild(div);
  });
}
fillSlides(shuffledSentences);

// Sounds effect

const soundBtn = document.getElementById("soundToggle");
const correctSound = new Audio("sounds/correct.mp3");
const pointSound = new Audio("sounds/cute-level-up.mp3");

let soundEnabled = true;

function playSound(sound) {
  if (!soundEnabled) return;
  sound.currentTime = 0;
  sound.play();
}

soundBtn.addEventListener("click", () => {
  soundEnabled = !soundEnabled;
  soundBtn.className = soundEnabled ? "sound on" : "sound off";
});

// Next button timer for slider

let autoSlideTimer = null;

function cancelAutoSlide() {
  if (autoSlideTimer) {
    clearTimeout(autoSlideTimer);
    autoSlideTimer = null;
  }
}

// Points

const pointsDisplay = document.getElementById("pointsDisplay");
let totalScore = 0;

function showPlusOne(targetEl) {
  const plus = document.createElement("div");
  plus.className = "plus-one";
  plus.textContent = "+1";

  const rect = targetEl.getBoundingClientRect();
  plus.style.left = rect.left + "px";
  plus.style.top = rect.top + "px";

  document.body.appendChild(plus);

  requestAnimationFrame(() => {
    plus.style.transform = "translateY(-25px)";
    plus.style.opacity = "0";
  });

  plus.addEventListener("transitionend", () => plus.remove());
}

// Timer for game start

const timeDisplay = document.getElementById("timeDisplay");

let timer = null;
let startTime = null;
let finalTime = null;
let seconds = 0;

let gameFinished = false;

function formatTime(seconds) {
  const minutes = String(Math.floor(seconds / 60));
  const sec = String(seconds % 60).padStart(2, "0");
  return `${minutes}:${sec}`;
}

function startTimer() {
  if (timer) return;
  startTime = Date.now();

  timer = setInterval(() => {
    seconds = Math.floor((Date.now() - startTime) / 1000);
    timeDisplay.textContent = formatTime(seconds);
  }, 500);
}

// Finish game

function checkGameFinished() {
  const allSentences = document.querySelectorAll("[data-sentence]");
  const allCompleted = [...allSentences].every(
    (el) => el.dataset.completed === "true"
  );

  if (allCompleted && !gameFinished) {
    gameFinished = true;
    setTimeout(finishGame, 2000);
  }
}

function finishGame() {
  finalTime = seconds;
  clearInterval(timer);
  timer = null;

  showGamePopup({
    score: totalScore,
    time: formatTime(finalTime),
  });
}

// Drag & drop

const draggableElements = document.querySelectorAll(".element");
const items = document.querySelectorAll(".items");

let draggedEl = null;

let indicator = document.createElement("div");
indicator.classList.add("drop-indicator");

function checkCorrectWords(currentSentence, droppedEl) {
  const sentenceIndex = Number(currentSentence.dataset.sentence);
  const correctWords = correctOrders[sentenceIndex];
  const currentEls = Array.from(currentSentence.children);

  let madeMistake = currentSentence.dataset.madeMistake === "true";
  let lastCorrectIndex = -1;
  let newCorrectWords = [];

  currentEls.forEach((el) => el.classList.remove("correct"));

  const markNewCorrect = function (word, isNew) {
    if (isNew) {
      word.dataset.counted = "true";
      newCorrectWords.push(word);
    }
  };

  for (let i = 0; i < currentEls.length; i++) {
    const word = currentEls[i].textContent.trim();
    if (word === correctWords[i]) {
      const isNew = !currentEls[i].dataset.counted;
      currentEls[i].classList.add("correct");
      markNewCorrect(currentEls[i], isNew);
      lastCorrectIndex = i;
    } else {
      break;
    }
  }

  newCorrectWords.forEach((el) => showPlusOne(el));

  const droppedIndex = currentEls.indexOf(droppedEl);
  if (droppedIndex <= lastCorrectIndex) {
    playSound(correctSound);
  } else {
    madeMistake = true;
    currentSentence.dataset.madeMistake = "true";
  }

  return { madeMistake, currentEls, lastCorrectIndex };
}

draggableElements.forEach((el) => {
  el.addEventListener("pointerdown", (e) => e.stopPropagation());

  el.addEventListener("dragstart", () => {
    draggedEl = el;
    el.classList.add("dragging");
  });

  el.addEventListener("dragend", () => {
    const droppedEl = draggedEl;
    draggedEl = null;

    indicator.remove();

    if (!droppedEl) return;

    requestAnimationFrame(() => {
      const currentSentence = droppedEl.parentNode;
      if (!currentSentence) return;

      if (!currentSentence.dataset.started) {
        currentSentence.dataset.started = "true";
        currentSentence.dataset.madeMistake = "false";
        startTimer();
      }

      const { lastCorrectIndex, madeMistake, currentEls } = checkCorrectWords(
        currentSentence,
        droppedEl
      );

      droppedEl.classList.remove("dragging");

      // Finish sentence if completed

      if (lastCorrectIndex === currentEls.length - 1) {
        let score = madeMistake ? currentEls.length : currentEls.length * 2;
        totalScore += score;
        pointsDisplay.textContent = totalScore;
        playSound(pointSound);

        currentSentence.dataset.completed = "true";

        currentEls.forEach((el) => {
          el.setAttribute("draggable", "false");
        });

        autoSlideTimer = setTimeout(() => {
          swiper.slideNext();
        }, 4000);
      }

      checkGameFinished();
    });
  });
});

items.forEach((p) => {
  p.addEventListener("dragover", (e) => {
    e.preventDefault();

    const dropTarget = findClosestElement(p, e.clientX, e.clientY);

    if (dropTarget == null) {
      p.appendChild(indicator);
    } else {
      p.insertBefore(indicator, dropTarget);
    }
  });

  p.addEventListener("drop", (e) => {
    e.preventDefault();

    if (!indicator.parentNode) return;

    const dragged = draggedEl;

    if (!dragged) return;

    const r1 = dragged.getBoundingClientRect(); // старая позиция
    indicator.parentNode.replaceChild(dragged, indicator); // Меняем DOM
    const r2 = dragged.getBoundingClientRect(); // новая позиция
    const clone = dragged.cloneNode(true); // Создаём клон только для draggedEl
    clone.classList.add("clone-anim");

    clone.style.left = r1.left + "px";
    clone.style.top = r1.top + "px";
    clone.style.width = r1.width + "px";
    clone.style.height = r1.height + "px";

    document.body.appendChild(clone);

    dragged.style.visibility = "hidden";

    requestAnimationFrame(() => {
      clone.style.left = r2.left + "px";
      clone.style.top = r2.top + "px";
    });

    clone.addEventListener(
      "transitionend",
      () => {
        clone.remove();
        dragged.style.visibility = "visible";
      },
      { once: true }
    );
  });
});

function findClosestElement(container, x, y) {
  const elements = [...container.querySelectorAll(".element:not(.dragging)")];

  let closest = null;
  let closestOffset = Number.POSITIVE_INFINITY;

  elements.forEach((el) => {
    const box = el.getBoundingClientRect();
    const offset = x - box.left - box.width;
    if (
      y >= box.top &&
      y <= box.bottom &&
      offset < 0 &&
      Math.abs(offset) < closestOffset
    ) {
      closestOffset = Math.abs(offset);
      closest = el;
    }
  });

  return closest;
}

// Swiper Init

const swiper = new Swiper(".swiper", {
  // loop: true,
  navigation: false,
});

const itemsCount = document.querySelector(".items_count");

swiper.on("slideChange", function () {
  let currentSlide = swiper.realIndex + 1;
  itemsCount.textContent = currentSlide + " - " + totalSlides;
});

const prevBtn = document.querySelector(".btn-prev");
const nextBtn = document.querySelector(".btn-next");

prevBtn.addEventListener("click", () => {
  cancelAutoSlide();

  swiper.slidePrev();
});

nextBtn.addEventListener("click", () => {
  cancelAutoSlide();

  swiper.slideNext();
});
