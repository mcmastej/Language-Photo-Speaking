
const DATA = {
  levels: [
    { id: "beginner", name: "Beginner", color: "beginner" },
    { id: "intermediate", name: "Intermediate", color: "intermediate" },
    { id: "advanced", name: "Advanced", color: "advanced" }
  ],
  stacks: {
    beginner: [
      { id: "fruits", name: "Fruits", subtitle: "Basic vocabulary", cards: [
        { image:"apple", en:"What fruit is this?", ko:"이 과일은 뭐예요?", answer:"사과", acceptable:["사과","사과예요","사과입니다"] },
        { image:"banana", en:"What fruit is this?", ko:"이 과일은 뭐예요?", answer:"바나나", acceptable:["바나나","바나나예요","바나나입니다"] },
        { image:"watermelon", en:"What fruit is this?", ko:"이 과일은 뭐예요?", answer:"수박", acceptable:["수박","수박이에요","수박입니다"] },
        { image:"cherry", en:"What fruit is this?", ko:"이 과일은 뭐예요?", answer:"체리", acceptable:["체리","체리예요","체리입니다"] },
        { image:"strawberry", en:"What fruit is this?", ko:"이 과일은 뭐예요?", answer:"딸기", acceptable:["딸기","딸기예요","딸기입니다"] },
        { image:"mango", en:"What fruit is this?", ko:"이 과일은 뭐예요?", answer:"망고", acceptable:["망고","망고예요","망고입니다"] },
        { image:"grapes", en:"What fruit is this?", ko:"이 과일은 뭐예요?", answer:"포도", acceptable:["포도","포도예요","포도입니다"] },
        { image:"orange", en:"What fruit is this?", ko:"이 과일은 뭐예요?", answer:"오렌지", acceptable:["오렌지","오렌지예요","오렌지입니다"] },
        { image:"lemon", en:"What fruit is this?", ko:"이 과일은 뭐예요?", answer:"레몬", acceptable:["레몬","레몬이에요","레몬입니다"] },
        { image:"peach", en:"What fruit is this?", ko:"이 과일은 뭐예요?", answer:"복숭아", acceptable:["복숭아","복숭아예요","복숭아입니다"] }
      ] }
    ],
    intermediate: [],
    advanced: []
  }
};

const state = {
  screen: "home",
  level: null,
  stack: null,
  queue: [],
  current: null,
  wrong: false,
  listening: false,
  recognition: null,
  speech: null,
  typed: ""
};

const $ = (id) => document.getElementById(id);
const app = $("app");

function normalize(s) {
  return (s || "")
    .toLowerCase()
    .replace(/[.,!?;:'"“”‘’()[\]{}]/g, "")
    .replace(/\s+/g, "")
    .trim();
}

function shuffle(a) {
  return [...a].sort(() => Math.random() - 0.5);
}

function renderHome() {
  state.screen = "home";
  app.innerHTML = `
    <section class="screen home-screen">
      <header class="hero">
        <div class="eyebrow">KOREAN SPEAKING PRACTICE</div>
        <h1>한국어 말하기</h1>
        <p>사진과 질문을 보고 한국어로 답해 보세요.</p>
      </header>
      <div class="level-list">
        ${DATA.levels.map(l => `
          <button class="level-card ${l.color}" data-level="${l.id}">
            <span class="level-title">${l.name}</span>
            <span class="level-arrow">›</span>
          </button>`).join("")}
      </div>
    </section>`;
  document.querySelectorAll("[data-level]").forEach(b => b.onclick = () => renderStacks(b.dataset.level));
}

function renderStacks(levelId) {
  state.level = levelId;
  state.screen = "stacks";
  const level = DATA.levels.find(x => x.id === levelId);
  const stacks = DATA.stacks[levelId];
  app.innerHTML = `
    <section class="screen">
      <button class="back" id="backHome">‹ Home</button>
      <header class="page-header">
        <span class="level-pill ${level.color}">${level.name}</span>
        <h1>Stacks</h1>
        <p>Choose a topic to begin.</p>
      </header>
      <div class="stack-list">
        ${stacks.length ? stacks.map(s => `
          <button class="stack-card" data-stack="${s.id}">
            <span><strong>${s.name}</strong><small>${s.cards.length} questions · ${s.subtitle}</small></span>
            <span class="arrow">›</span>
          </button>`).join("") : `<div class="empty">More ${level.name.toLowerCase()} stacks coming soon.</div>`}
      </div>
    </section>`;
  $("backHome").onclick = renderHome;
  document.querySelectorAll("[data-stack]").forEach(b => b.onclick = () => startStack(levelId, b.dataset.stack));
}

function startStack(levelId, stackId) {
  const stack = DATA.stacks[levelId].find(s => s.id === stackId);
  state.stack = stack;
  state.queue = shuffle(stack.cards.map((_, i) => i));
  state.current = null;
  state.wrong = false;
  renderCard();
}

function currentCard() {
  return state.stack.cards[state.queue[0]];
}

function renderCard() {
  if (!state.queue.length) {
    renderComplete();
    return;
  }
  stopListening();
  window.speechSynthesis.cancel();
  state.wrong = false;
  state.typed = "";
  state.current = currentCard();
  state.screen = "card";
  const c = state.current;
  const position = state.stack.cards.length - state.queue.length + 1;
  app.innerHTML = `
    <section class="screen card-screen">
      <div class="topbar">
        <button class="back" id="backStacks">‹ Stacks</button>
        <span class="progress">${state.stack.cards.length - state.queue.length + 1} / ${state.stack.cards.length}</span>
      </div>
      <header class="card-header">
        <span class="level-pill beginner">Beginner</span>
        <h1>${state.stack.name}</h1>
      </header>

      <article class="practice-card">
        <div class="image-frame">
          <img src="images/${c.image}.svg" alt="${c.answer}">
        </div>
        <div class="question">
          <div class="english">${c.en}</div>
          <div class="korean-row">
            <div class="korean">${c.ko}</div>
            <button class="icon-button" id="speakQuestion" aria-label="Play question">🔊</button>
          </div>
        </div>

        <div class="answer-area">
          <div class="answer-label">Your answer</div>
          <div class="answer-input-row">
            <input id="answerInput" inputmode="text" autocomplete="off" placeholder="Type your answer in Korean" />
            <button class="mic-button" id="micButton" aria-label="Speak answer">🎙</button>
          </div>
          <div id="listenStatus" class="listen-status">Type your answer or tap the microphone.</div>
        </div>

        <button class="check-button" id="checkButton">Check answer</button>
        <div id="result" class="result hidden"></div>
      </article>
    </section>`;

  $("backStacks").onclick = () => { stopListening(); window.speechSynthesis.cancel(); renderStacks(state.level); };
  $("speakQuestion").onclick = speakQuestion;
  $("checkButton").onclick = checkAnswer;
  $("answerInput").addEventListener("keydown", e => { if(e.key === "Enter") checkAnswer(); });
  $("micButton").onclick = toggleListening;

  // Automatically play the question when the card appears.
  setTimeout(speakQuestion, 450);
}

function speakQuestion() {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(state.current.ko);
  u.lang = "ko-KR";
  u.rate = 0.88;
  u.pitch = 1;
  window.speechSynthesis.speak(u);
}

function setupRecognition() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) return null;
  const r = new SR();
  r.lang = "ko-KR";
  r.continuous = false;
  r.interimResults = true;
  r.onstart = () => {
    state.listening = true;
    $("micButton").classList.add("active");
    $("micButton").textContent = "■";
    $("listenStatus").textContent = "듣고 있습니다…";
  };
  r.onresult = e => {
    let text = "";
    for (let i=e.resultIndex;i<e.results.length;i++) text += e.results[i][0].transcript;
    $("answerInput").value = text;
  };
  r.onerror = e => {
    state.listening = false;
    if ($("listenStatus")) $("listenStatus").textContent = "음성 인식 오류: " + e.error;
  };
  r.onend = () => {
    state.listening = false;
    if ($("micButton")) { $("micButton").classList.remove("active"); $("micButton").textContent = "🎙"; }
    if ($("listenStatus")) $("listenStatus").textContent = "인식이 끝났습니다. 답을 확인하세요.";
  };
  return r;
}

function toggleListening() {
  if (state.listening) { stopListening(); return; }
  if (!state.recognition) state.recognition = setupRecognition();
  if (!state.recognition) {
    $("listenStatus").textContent = "이 브라우저에서는 음성 인식을 사용할 수 없습니다. 직접 입력해 주세요.";
    $("answerInput").focus();
    return;
  }
  try { state.recognition.start(); } catch(e) {}
}

function stopListening() {
  if (state.recognition && state.listening) {
    try { state.recognition.stop(); } catch(e) {}
  }
  state.listening = false;
}

function checkAnswer() {
  if (state.wrong) {
    nextCard();
    return;
  }
  const value = normalize($("answerInput").value);
  const ok = state.current.acceptable.some(a => normalize(a) === value);
  const result = $("result");
  if (!value) {
    result.className = "result error";
    result.innerHTML = "Please type or say an answer first.";
    return;
  }
  if (ok) {
    result.className = "result correct";
    result.innerHTML = `<strong>Correct!</strong><span>${state.current.answer}</span>`;
    $("checkButton").textContent = "Next";
    $("checkButton").classList.add("next-button");
    $("answerInput").disabled = true;
    $("micButton").disabled = true;
  } else {
    state.wrong = true;
    // Move this card to the end of the queue; it will be revisited later.
    state.queue.push(state.queue.shift());
    result.className = "result incorrect";
    result.innerHTML = `<strong>Correct answer</strong><span>${state.current.answer}</span><small>Your answer: ${$("answerInput").value}</small>`;
    $("checkButton").textContent = "Next";
    $("checkButton").classList.add("next-button");
    $("answerInput").disabled = true;
    $("micButton").disabled = true;
  }
}

function nextCard() {
  // Correct cards are removed; incorrect cards were already moved to the end.
  if (!state.wrong) state.queue.shift();
  renderCard();
}

function renderComplete() {
  state.screen = "complete";
  app.innerHTML = `
    <section class="screen complete-screen">
      <div class="complete-icon">✓</div>
      <div class="eyebrow">STACK COMPLETE</div>
      <h1>Fruits</h1>
      <p>You answered all 10 questions correctly.</p>
      <button class="check-button" id="again">Practice again</button>
      <button class="secondary-button" id="backStacks">Back to Stacks</button>
    </section>`;
  $("again").onclick = () => startStack(state.level, state.stack.id);
  $("backStacks").onclick = () => renderStacks(state.level);
}

renderHome();
