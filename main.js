/* ==========================================================================
   Ethio Tefetagn — shared site behavior
   ========================================================================== */

/* ---- Mobile nav toggle ---- */
document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".site-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", () => nav.classList.toggle("open"));
  }
});

/* ---- Exam countdown ----
   Update EXAM_DATE to the official ESSLCE date once it is announced
   for the relevant academic year. */
const EXAM_DATE = new Date("2027-06-01T09:00:00+03:00");

function initCountdown() {
  const el = document.getElementById("countdown-days");
  if (!el) return;
  const now = new Date();
  const diffMs = EXAM_DATE - now;
  const days = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
  el.textContent = days;
}

/* ---- Visitor counter ----
   Tries the backend API (see /server) for a real, site-wide count.
   Falls back to a local-only demo counter if no backend is configured,
   clearly labelled so it is never mistaken for real traffic data. */
const API_BASE = window.ETHIOTEFETAGN_API_BASE || ""; // e.g. "https://api.ethiotefetagn.com"

async function initVisitorCounter() {
  const numEl = document.getElementById("visit-count");
  const labelEl = document.getElementById("visit-label");
  if (!numEl) return;

  if (!API_BASE) {
    localDemoCounter(numEl, labelEl);
    return;
  }

  try {
    const alreadyCounted = sessionStorage.getItem("et_visit_counted");
    const endpoint = API_BASE + "/api/visit";
    const res = await fetch(endpoint, { method: alreadyCounted ? "GET" : "POST" });
    if (!res.ok) throw new Error("bad response");
    const data = await res.json();
    numEl.textContent = data.total.toLocaleString();
    if (labelEl) labelEl.textContent = "visitors so far";
    sessionStorage.setItem("et_visit_counted", "1");
  } catch (err) {
    localDemoCounter(numEl, labelEl);
  }
}

function localDemoCounter(numEl, labelEl) {
  let count = parseInt(localStorage.getItem("et_demo_visits") || "0", 10);
  if (!sessionStorage.getItem("et_visit_counted")) {
    count += 1;
    localStorage.setItem("et_demo_visits", String(count));
    sessionStorage.setItem("et_visit_counted", "1");
  }
  numEl.textContent = count.toLocaleString();
  if (labelEl) labelEl.textContent = "visits on this device (demo — connect the backend for a site-wide count)";
}

/* ---- Dark mode toggle ----
   The initial theme is already applied by an inline script in <head>
   (before first paint, to avoid a flash). This just wires up the button. */
function initThemeToggle() {
  const btn = document.getElementById("theme-toggle");
  if (!btn) return;
  btn.addEventListener("click", () => {
    const isDark = document.documentElement.getAttribute("data-theme") === "dark";
    if (isDark) {
      document.documentElement.removeAttribute("data-theme");
      localStorage.setItem("et_theme", "light");
    } else {
      document.documentElement.setAttribute("data-theme", "dark");
      localStorage.setItem("et_theme", "dark");
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initCountdown();
  initVisitorCounter();
  initThemeToggle();
});
