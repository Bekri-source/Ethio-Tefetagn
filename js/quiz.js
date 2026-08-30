/* ==========================================================================
   Ethio Tefetagn — quiz engine
   ========================================================================== */
const params = new URLSearchParams(window.location.search);
const subjectId = params.get("subject");
const streamKey = params.get("stream") || "natural";
const meta = SUBJECT_META[subjectId];
const questions = (QUESTION_BANK[subjectId] || []).slice();

let current = 0;
let score = 0;
let answered = false;
const userAnswers = [];

const els = {
  title: document.getElementById("quiz-title"),
  progress: document.getElementById("quiz-progress"),
  qCard: document.getElementById("q-card"),
  actions: document.getElementById("quiz-actions"),
  backLink: document.getElementById("back-link")
};

function init() {
  if (!meta || questions.length === 0) {
    els.qCard.innerHTML = `<p>We couldn't find that subject. <a href="dashboard.html?stream=${streamKey}">Go back to your dashboard</a>.</p>`;
    els.actions.style.display = "none";
    return;
  }
  els.title.textContent = meta.name + " practice";
  els.backLink.href = `dashboard.html?stream=${streamKey}`;
  renderQuestion();
}

function renderQuestion() {
  answered = false;
  const q = questions[current];
  els.progress.textContent = `Question ${current + 1} of ${questions.length}`;

  const letters = ["A", "B", "C", "D", "E", "F"];
  const choicesHtml = q.choices.map((c, i) => `
    <button class="choice" data-index="${i}">
      <span class="letter">${letters[i]}</span>
      <span>${c}</span>
    </button>
  `).join("");

  els.qCard.innerHTML = `
    <span class="q-number">Q${current + 1}</span>
    <h3>${q.q}</h3>
    <div class="choices">${choicesHtml}</div>
    <div class="explain" id="explain-box"><strong>Why:</strong> ${q.explain}</div>
  `;

  els.qCard.querySelectorAll(".choice").forEach(btn => {
    btn.addEventListener("click", () => selectAnswer(parseInt(btn.dataset.index, 10)));
  });

  updateActions();
}

function selectAnswer(index) {
  if (answered) return;
  answered = true;
  const q = questions[current];
  userAnswers[current] = index;
  if (index === q.answer) score++;

  els.qCard.querySelectorAll(".choice").forEach((btn, i) => {
    btn.setAttribute("disabled", "true");
    if (i === q.answer) btn.classList.add("correct");
    else if (i === index) btn.classList.add("incorrect");
  });
  document.getElementById("explain-box").classList.add("show");
  updateActions();
}

function updateActions() {
  const isLast = current === questions.length - 1;
  els.actions.innerHTML = `
    <button class="btn btn-ghost" id="prev-btn" ${current === 0 ? "disabled" : ""}>← Previous</button>
    <button class="btn btn-primary" id="next-btn" ${answered ? "" : "disabled"}>${isLast ? "See results" : "Next question →"}</button>
  `;
  document.getElementById("prev-btn").addEventListener("click", () => {
    if (current > 0) { current--; renderQuestion(); }
  });
  document.getElementById("next-btn").addEventListener("click", () => {
    if (isLast) showResults();
    else { current++; renderQuestion(); }
  });
}

function showResults() {
  saveProgress(subjectId, score, questions.length);
  const pct = Math.round((score / questions.length) * 100);
  els.progress.textContent = "Complete";
  els.qCard.innerHTML = `
    <div class="results-card">
      <p class="eyebrow">${meta.name} — results</p>
      <div class="results-score">${score}/${questions.length}</div>
      <p>${pct}% correct this attempt.</p>
      <div class="hero-cta" style="justify-content:center;margin-top:20px;">
        <button class="btn btn-primary" id="retry-btn">Try again</button>
        <a class="btn btn-ghost" href="dashboard.html?stream=${streamKey}">Back to dashboard</a>
      </div>
    </div>
  `;
  els.actions.innerHTML = "";
  document.getElementById("retry-btn").addEventListener("click", () => {
    current = 0; score = 0; userAnswers.length = 0;
    renderQuestion();
  });
}

init();
