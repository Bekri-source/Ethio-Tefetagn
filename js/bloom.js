/* ==========================================================================
   Ethio Tefetagn — the "readiness bloom"
   Each petal represents one subject; petal opacity/size reflects the
   student's average quiz score for that subject (0–100%).
   petals: [{ label, color, progress }]
   ========================================================================== */
function renderBloom(petals) {
  const cx = 200, cy = 200;
  const count = petals.length;
  const step = 360 / count;
  let petalMarkup = "";

  petals.forEach((p, i) => {
    const angle = i * step;
    const progress = Math.max(4, Math.min(100, p.progress || 0));
    const length = 60 + (progress / 100) * 60;   // 60–120
    const width = 26 + (progress / 100) * 18;    // 26–44
    const opacity = 0.35 + (progress / 100) * 0.65;
    const ry = length;
    const rx = width;
    const tipY = cy - 46 - (length - ry); // keep petal base near core

    petalMarkup += `
      <g transform="rotate(${angle} ${cx} ${cy})">
        <ellipse cx="${cx}" cy="${cy - 46 - ry / 2}" rx="${rx / 2}" ry="${ry / 2}"
          fill="${p.color}" fill-opacity="${opacity.toFixed(2)}"
          stroke="${p.color}" stroke-width="1.5">
          <title>${p.label}: ${Math.round(p.progress || 0)}%</title>
        </ellipse>
      </g>`;
  });

  return `
  <svg class="bloom" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Readiness bloom showing quiz progress per subject">
    ${petalMarkup}
    <circle cx="${cx}" cy="${cy}" r="30" fill="var(--gold)" stroke="var(--gold-deep)" stroke-width="2" />
    <circle cx="${cx}" cy="${cy}" r="30" fill="none" stroke="#fff" stroke-width="1" stroke-dasharray="3 5" opacity="0.6"/>
  </svg>`;
}

/* Reads locally-stored quiz results and returns an average % per subject.
   Real accounts / server-synced progress can replace this later. */
function getProgress(subjectId) {
  const raw = localStorage.getItem("et_progress_" + subjectId);
  if (!raw) return 0;
  try {
    const data = JSON.parse(raw);
    return Math.round((data.correct / data.total) * 100);
  } catch (e) {
    return 0;
  }
}

function saveProgress(subjectId, correct, total) {
  const existing = localStorage.getItem("et_progress_" + subjectId);
  let record = { correct: 0, total: 0, attempts: 0 };
  if (existing) {
    try { record = JSON.parse(existing); } catch (e) {}
  }
  // Store the most recent attempt's score (simple, transparent to the student)
  record = { correct, total, attempts: (record.attempts || 0) + 1 };
  localStorage.setItem("et_progress_" + subjectId, JSON.stringify(record));
}
