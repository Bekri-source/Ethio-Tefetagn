/* ==========================================================================
   Ethio Tefetagn — Textbook Library
   Fetches /api/books from the backend and renders a subject × grade table
   with view/download links, or a clear "backend not connected" fallback.
   ========================================================================== */
const API_BASE = window.ETHIOTEFETAGN_API_BASE || "";
const GRADES = [9, 10, 11, 12];
const BOOK_SUBJECTS = ["maths", "english", "biology", "chemistry", "physics", "economics", "geography", "history"];

async function loadLibrary() {
  const body = document.getElementById("library-body");
  const note = document.getElementById("library-note");

  if (!API_BASE) {
    renderOffline(body, note);
    return;
  }

  try {
    const res = await fetch(API_BASE + "/api/books");
    if (!res.ok) throw new Error("bad response");
    const data = await res.json();
    renderTable(data.books, body, note);
  } catch (err) {
    renderOffline(body, note);
  }
}

function renderTable(books, body, note) {
  body.innerHTML = "";
  BOOK_SUBJECTS.forEach(subjectId => {
    const meta = SUBJECT_META[subjectId];
    const row = document.createElement("tr");

    let cells = `<td><span class="lib-subject"><span class="lib-swatch" style="background:${meta.color}"></span>${meta.name}</span></td>`;

    GRADES.forEach(grade => {
      const entry = books.find(b => b.subject === subjectId && b.grade === grade);
      cells += `<td>${renderCell(subjectId, grade, entry)}</td>`;
    });

    row.innerHTML = cells;
    body.appendChild(row);
  });

  note.style.display = "none";
}

function renderCell(subjectId, grade, entry) {
  if (!entry || !entry.available) {
    return `<div class="lib-cell"><span class="lib-status missing">Not yet uploaded</span></div>`;
  }
  const fileUrl = `${API_BASE}/api/books/file/${subjectId}/${grade}`;
  const statusBadge = entry.indexed
    ? `<span class="lib-status indexed">AI-ready</span>`
    : `<span class="lib-status available">Uploaded</span>`;
  return `
    <div class="lib-cell">
      ${statusBadge}
      <a class="lib-link" href="${fileUrl}" target="_blank" rel="noopener">View / Download →</a>
    </div>`;
}

function renderOffline(body, note) {
  body.innerHTML = "";
  BOOK_SUBJECTS.forEach(subjectId => {
    const meta = SUBJECT_META[subjectId];
    const row = document.createElement("tr");
    const cells = GRADES.map(() => `<td><span class="lib-status missing">Backend not connected</span></td>`).join("");
    row.innerHTML = `<td><span class="lib-subject"><span class="lib-swatch" style="background:${meta.color}"></span>${meta.name}</span></td>${cells}`;
    body.appendChild(row);
  });

  note.style.display = "block";
  note.innerHTML = `<strong>The Library needs the backend running to show real books.</strong> Set <code>window.ETHIOTEFETAGN_API_BASE</code> to your deployed backend's URL (see the project README), then this page will list every textbook that's been uploaded to the <code>Books/</code> folder, with view/download links.`;
}

document.addEventListener("DOMContentLoaded", loadLibrary);
