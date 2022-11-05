// COLOR CHANGE NOT WORKING ON MOBILE

const inputBoxes = document.querySelectorAll(".input-box");
const wordBtn = document.querySelector("#wordBtn");
const wordForm = document.querySelector("#wordForm");
const inputArea = document.querySelector("#inputArea");
const restartBtn = document.querySelector("#restartBtn");
const wordTextArea = document.querySelector("#wordTextArea");
const defintionTextArea = document.querySelector("#defintionTextArea");
const attemptsLeftDisplay = document.querySelector("#attemptsLeftDisplay");
const timerDisplay = document.querySelector("#timerDisplay");
const outcome = document.querySelector("#outcome");

let isPlaying = true;
let word = "";
let wordMeaning = "";
let guessedWord = "";
let attempts = 0;
let attemptsLeft = 5;
let [milliseconds, seconds, minutes, hours] = [0, 0, 0, 0];
let int = null;

// TIMER FUNCTIONS
const startTimer = () => {
  if (isPlaying) {
    if (int !== null) {
      clearInterval(int);
    }
    int = setInterval(timerCalc, 10);
  }
};

const stopTimer = () => {
  clearInterval(int);
};

const resetTimer = () => {
  clearInterval(int);
  [milliseconds, seconds, minutes, hours] = [0, 0, 0, 0];
  timerDisplay.innerHTML = "00 : 00 : 00 : 000 ";
};

const timerCalc = () => {
  milliseconds += 10;
  if (milliseconds == 1000) {
    milliseconds = 0;
    seconds++;

    if (seconds == 60) {
      seconds = 0;
      minutes++;

      if (minutes == 60) {
        minutes = 0;
        hours++;
      }
    }
  }
  let h = hours < 10 ? "0" + hours : hours;
  let m = minutes < 10 ? "0" + minutes : minutes;
  let s = seconds < 10 ? "0" + seconds : seconds;
  let ms =
    milliseconds < 10
      ? "00" + milliseconds
      : milliseconds < 100
      ? "0" + milliseconds
      : milliseconds;
  timerDisplay.innerHTML = ` ${h} : ${m} : ${s} : ${ms}`;
};

// EVENT LISTENERS
document.body.addEventListener("keyup", function (e) {
  let inputBox = e.target;
  if (inputBox.classList == "input-box") {
    if (e.code.includes("Key") || e.code === "Enter") {
      startTimer();
      if (inputBox.value.length == 1 && inputBox.nextElementSibling) {
        inputBox.nextElementSibling.focus();
      }
    } else {
      if (e.code !== "Backspace") {
        alert("Enter letters only");
        inputBox.value = "";
        if (e.code === "Tab") {
          inputBox.previousElementSibling.focus();
        }
      }
    }
  }
  if (e.code === "Backspace" && !inputBox.value) {
    inputBox.previousElementSibling.focus();
    inputBox.previousElementSibling.value = "";
  }
});

document.body.addEventListener("keydown", function (e) {
  if (e.code === "Enter") {
    checkword(e);
  }
});

document.body.addEventListener("touchend", function (e) {
  if (e.code === "Enter") {
    document.body.style.backgroundColor = "blue";
    checkword(e);
  }
});

wordBtn.addEventListener("touchend", (e) => {
  // TESTING CODE BELOW
  // document.body.style.backgroundColor = "green";
  checkword(e);
});

wordBtn.addEventListener("click", (e) => {
  checkword(e);
});

// REFACTOR THIS. STILL NOT WORKING ON IOS
function checkLine(currentLineBoxes) {
  for (var i = 0; i < currentLineBoxes.length; i++) {
    var currentBox = currentLineBoxes[i];
    var char = currentBox.value;
    guessedWord += char;
    // currentBox.classList.add("grey");
    currentBox.style.backgroundColor = "#9e9d9d";

    if (word.indexOf(currentLineBoxes[i].value) !== -1) {
      alert("LETTER IN WORD");
      // currentBox.classList.remove("grey");
      // currentBox.classList.add("orange");
      currentBox.style.backgroundColor = "#ffd380";
    }
    if (currentLineBoxes[i].value === word[i]) {
      // currentBox.classList.remove("grey");
      // currentBox.classList.add("green");
      currentBox.style.backgroundColor = "#80ff80";
    }
    inputsReadOnly(currentLineBoxes);
  }
}

function checkword(e) {
  e.preventDefault();
  if (isPlaying) {
    const currentLine = document.querySelector(`.line-${attempts}`);
    const currentLineBoxes = currentLine.childNodes;
    // VAR USED INSTEAD OF LET
    var fullWord = true;
    currentLineBoxes.forEach((element) => {
      if (!element.value) {
        fullWord = false;
      }
    });

    if (fullWord) {
      updateAttempts();
      // alert(word);
      checkLine(currentLineBoxes);
      if (guessedWord === word) {
        stopTimer();
        outcome.textContent = "YOU WIN!";
        wordTextArea.textContent = word;
        displayDefinition();
        document.activeElement.blur();
        isPlaying = false;
        return;
      }
      if (attempts < 5) {
        guessedWord = "";
        addWordRow();
      } else {
        stopTimer();
        outcome.textContent = "YOU LOSE!";
        wordTextArea.textContent = word;
        displayDefinition();
        isPlaying = false;
        document.activeElement.blur();

        return;
      }
    } else {
      alert("Enter the missing letter(s)");
    }
  }
}

const inputsReadOnly = (inputs) => {
  inputs.forEach((i) => {
    i.setAttribute("readonly", true);
  });
};

restartBtn.addEventListener("click", (e) => {
  e.preventDefault;
  resetTimer();
  startGame();
});

// FUNCTIONS BELWO RETRIEVE WORD AND MEANING THROUGH APIS
const getWord = async () => {
  try {
    const res = await fetch(
      "https://random-word-api.herokuapp.com/word?length=5"
    );
    const data = await res.json();
    word = data[0];
    getDefinition();

    return word;
  } catch (e) {
    alert("I'm sorry we cannot start the game right now...");
  }
};

const getDefinition = async () => {
  try {
    const res = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`
    );
    const data = await res.json();
    const definition = data[0].meanings[0].definitions[0].definition;
    if (definition) {
      wordMeaning = definition;
    }
  } catch (e) {
    wordMeaning = "Cant find the meaning sorry...";
    return;
  }
};

const displayDefinition = () => {
  definitionTextArea.textContent = wordMeaning;
};

const addWordRow = () => {
  const inputLine = document.createElement("div");
  inputLine.classList.add("input-line");
  inputLine.classList.add(`line-${attempts}`);
  for (let i = 0; i < 5; i++) {
    const wordInput = document.createElement("input");
    wordInput.classList.add("input-box");
    wordInput.setAttribute("maxlength", "1");
    wordInput.setAttribute("type", "text");
    wordInput.style.textTransform = "uppercase";
    inputLine.append(wordInput);
  }
  inputArea.append(inputLine);
  inputLine.firstChild.focus();
  alert(word);
};

const updateAttempts = () => {
  attempts++;
  attemptsLeft--;
  attemptsLeftDisplay.textContent = attemptsLeft;
};

const deleteLines = () => {
  let child = inputArea.lastChild;
  while (child) {
    inputArea.removeChild(child);
    child = inputArea.lastChild;
  }
};

const startGame = () => {
  isPlaying = true;
  getWord();
  deleteLines();
  attemptsLeft = 5;
  attemptsLeftDisplay.textContent = attemptsLeft;
  attempts = 0;
  guessedWord = "";
  word = "";
  outcome.textContent = "";
  wordTextArea.textContent = "";
  definitionTextArea.textContent = "";
  addWordRow();
};

startGame();
