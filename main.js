let level = parseInt(window.localStorage.getItem("level")) || 1
const addBtn = document.getElementById("add-box-btn")
const config = {
  colors: ["green", "blue", "yellow", "purple", "orange"],
  boxAmount: 5,
  extraBox: 2,
  maxPerColor: 4, //constant
  maxSpansPerBox: 4 //constant
};

const ul = document.querySelector("ul");
const resetBtn = document.getElementById("btn");
const winText = document.querySelector(".win");
let thereIsActive = false;
let boxes = [];

document.addEventListener("DOMContentLoaded", startGame);
resetBtn.addEventListener("click", startGame);

function startGame() {
  ul.innerHTML = "";
  winText.innerText = "";
  resetBtn.style.display = "none";
  thereIsActive = false;

  boxes = Array.from({ length: config.boxAmount }, (_, i) => {
    const li = document.createElement("li");
    li.id = `box${i + 1}`;
    ul.appendChild(li);
    return li;
  });

  fillBoxesWithColors(boxes, config.colors, config.maxPerColor);
  
  addExtraBox(config.extraBox)

  document.querySelectorAll("li").forEach((box) => {
    box.addEventListener("click", () => handleBoxClick(box));
  });
}

addBtn.addEventListener("click", () => {
  addExtraBox(1)
})

function handleBoxClick(clickedBox) {
  const allBoxes = document.querySelectorAll("li");
  if (!thereIsActive) {
    allBoxes.forEach(b => b.classList.remove("active"));
    clickedBox.classList.add("active");
    thereIsActive = true;
  } else {
    if (clickedBox.classList.contains("active")) {
      clearActive(allBoxes, false);
    } else {
      const activeBox = document.querySelector(".active");
      if (activeBox !== clickedBox) {
        shiftSpans(activeBox, clickedBox);
        clearActive(allBoxes, false);
        checkWin(allBoxes);
      } else {
        clearActive(allBoxes, true);
        clickedBox.classList.add("active");
      }
    }
  }
}

function clearActive(boxes, state) {
  boxes.forEach(b => b.classList.remove("active"));
  thereIsActive = state;
}

//Todo: extra box may be needed  
function addExtraBox(num) {
  for (let i = 0; i < num; i++) {
    const li = document.createElement("li");
    ul.appendChild(li);
  }
}

function fillBoxesWithColors(boxes, colorList, maxPerColor) {
  const totalSpans = boxes.length * config.maxSpansPerBox;
  const mainColor = colorList[Math.floor(Math.random() * colorList.length)];
  const colorPool = [];
  const colorCount = { [mainColor]: maxPerColor };

  for (let i = 0; i < maxPerColor; i++) colorPool.push(mainColor);

  while (colorPool.length < totalSpans) {
    const color = colorList[Math.floor(Math.random() * colorList.length)];
    if (!colorCount[color]) colorCount[color] = 0;
    if (colorCount[color] < maxPerColor) {
      colorPool.push(color);
      colorCount[color]++;
    }
  }

  shuffleArray(colorPool);

  boxes.forEach((box) => {
    box.innerHTML = "";
    for (let i = 0; i < config.maxSpansPerBox; i++) {
      const span = document.createElement("span");
      span.className = colorPool.pop();
      box.appendChild(span);
    }
  });
}

function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

function shiftSpans(fromBox, toBox) {
  const availableSpace = config.maxSpansPerBox - toBox.childNodes.length;
  if (availableSpace <= 0) return;

  const activeSpans = Array.from(fromBox.childNodes);
  if (activeSpans.length === 0) return;

  const lastColor = activeSpans[activeSpans.length - 1].className;
  const targetTop = toBox.lastChild?.className;

  // metch last colors and if it is not same, just leave it
  if (toBox.childNodes.length > 0 && lastColor !== targetTop) return;
  const left = toBox.getBoundingClientRect().left - fromBox.getBoundingClientRect().left
  const currentHeight = fromBox.getBoundingClientRect().y
  document.documentElement.style.setProperty("--left", `${left - (currentHeight / 2.5)}px`);
  fromBox.classList.add("pour")
  
  fromBox.addEventListener("animationend", ()=>{
    fromBox.classList.remove("pour")
    fromBox.style.position = "relative"

  })
  const spansToMove = [];
  for (let i = activeSpans.length - 1; i >= 0; i--) {
    if (activeSpans[i].className === lastColor && spansToMove.length < availableSpace) {
      spansToMove.push(activeSpans[i]);
    } else {
      break;
    }
  }

  for (let i = spansToMove.length - 1; i >= 0; i--) {
    toBox.appendChild(spansToMove[i]);
  }
}

function checkWin(allBoxes) {
  let allSame = true;

  allBoxes.forEach((box) => {
    const spans = Array.from(box.children);
    if (spans.length !== config.maxSpansPerBox && spans.length !== 0) {
      allSame = false;
      return;
    }

    if (spans.length === config.maxSpansPerBox) {
      const color = spans[0].className;
      if (!spans.every(s => s.className === color)) {
        allSame = false;
        return;
      }
    }
  });

  if (allSame) {
    winText.innerText = "You Win!";
    resetBtn.style.display = "block";
  }
}