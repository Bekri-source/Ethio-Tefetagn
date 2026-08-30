/* ==========================================================================
   Ethio Tefetagn — AI Study Assistant front end
   Talks to the /api/chat endpoint provided by /server (see server/server.js).
   Without a configured backend, it explains what's needed rather than failing silently.
   ========================================================================== */
const API_BASE = window.ETHIOTEFETAGN_API_BASE || "";

const picker = document.getElementById("subject-picker");
const gradePicker = document.getElementById("grade-picker");
const log = document.getElementById("chat-log");
const form = document.getElementById("chat-form");
const input = document.getElementById("chat-input");

const ALL_SUBJECTS = Array.from(new Set([...STREAMS.natural.subjects, ...STREAMS.social.subjects]));
ALL_SUBJECTS.forEach(id => {
  const opt = document.createElement("option");
  opt.value = id;
  opt.textContent = SUBJECT_META[id].name;
  picker.appendChild(opt);
});

let history = [];

function addMessage(role, text, citation) {
  const div = document.createElement("div");
  div.className = "msg " + role;
  div.innerHTML = escapeHtml(text) + (citation ? `<span class="cite">${escapeHtml(citation)}</span>` : "");
  log.appendChild(div);
  log.scrollTop = log.scrollHeight;
}

function escapeHtml(str) {
  const d = document.createElement("div");
  d.textContent = str;
  return d.innerHTML;
}

addMessage("bot", `Hi! I'm your Ethio Tefetagn study assistant. Pick a subject above and ask me anything — for example, "Explain how photosynthesis works" or "Walk me through solving quadratic equations."`);

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const message = input.value.trim();
  if (!message) return;
  const subject = picker.value;
  const grade = gradePicker.value || null;

  addMessage("user", message);
  history.push({ role: "user", content: message });
  input.value = "";
  input.disabled = true;

  const thinkingId = "thinking-" + Date.now();
  const thinkingEl = document.createElement("div");
  thinkingEl.className = "msg bot";
  thinkingEl.id = thinkingId;
  thinkingEl.textContent = "Thinking…";
  log.appendChild(thinkingEl);
  log.scrollTop = log.scrollHeight;

  try {
    if (!API_BASE) throw new Error("no-backend");
    const res = await fetch(API_BASE + "/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject, grade, message, history })
    });
    if (!res.ok) throw new Error("bad-response");
    const data = await res.json();
    document.getElementById(thinkingId).remove();
    addMessage("bot", data.reply, data.citation);
    history.push({ role: "assistant", content: data.reply });
  } catch (err) {
    document.getElementById(thinkingId).remove();
    addMessage(
      "bot",
      "The AI backend isn't connected yet in this preview. Once /server is deployed with an Anthropic API key (see server/README notes), I'll answer here — and once the curriculum books are indexed, I'll cite the exact page too."
    );
  } finally {
    input.disabled = false;
    input.focus();
  }
});
