import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore, collection, getDocs, query, where, orderBy, limit
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCyVedJuQp-WlVgxElhPLw87kBT_hbCy3k",
  authDomain: "youth-it-2e80e.firebaseapp.com",
  projectId: "youth-it-2e80e",
  storageBucket: "youth-it-2e80e.firebasestorage.app",
  messagingSenderId: "647500223077",
  appId: "1:647500223077:web:aaa5dd04468463173eec8c",
  measurementId: "G-LKD00C81X2"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const listEl = document.getElementById("list");
const emptyEl = document.getElementById("empty");
const pagerEl = document.getElementById("pager");

const PER_PAGE = 10;      // ✅ 한 페이지 글 수
const PAGE_WINDOW = 5;    // ✅ 페이지 번호 몇개 보여줄지(1~5, 6~10...)
let page = 1;

const fmtDate = (ts) => {
  if (!ts) return "-";
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}.${m}.${day}`;
};

const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (m) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m])
  );

let cached = [];

function scrollToCases(){
  const el = document.getElementById("cases");
  if (!el) return;
  window.scrollTo({ top: el.offsetTop - 90, behavior: "smooth" });
}

function renderPager(totalPages){
  if (!pagerEl) return;
  pagerEl.innerHTML = "";

  const makeBtn = (label, toPage, disabled=false, cls="") => {
    const a = document.createElement("a");
    a.href = "javascript:void(0)";
    a.textContent = label;
    if (cls) a.classList.add(cls);
    if (disabled) a.classList.add("is-disabled");
    a.addEventListener("click", () => {
      if (disabled) return;
      page = toPage;
      render(cached);
      scrollToCases();
    });
    pagerEl.appendChild(a);
  };

  const windowStart = Math.floor((page - 1) / PAGE_WINDOW) * PAGE_WINDOW + 1;
  const windowEnd = Math.min(totalPages, windowStart + PAGE_WINDOW - 1);

  // « 처음
  makeBtn("«", 1, page === 1, "p-icon");
  // ‹ 이전
  makeBtn("‹", Math.max(1, page - 1), page === 1, "p-icon");

  // 페이지 번호(윈도우)
  for (let p = windowStart; p <= windowEnd; p++){
    const a = document.createElement("a");
    a.href = "javascript:void(0)";
    a.textContent = String(p);
    if (p === page) a.classList.add("is-active");
    a.addEventListener("click", () => {
      page = p;
      render(cached);
      scrollToCases();
    });
    pagerEl.appendChild(a);
  }

  // › 다음
  makeBtn("›", Math.min(totalPages, page + 1), page === totalPages, "p-icon");
  // » 마지막
  makeBtn("»", totalPages, page === totalPages, "p-icon");
}

function render(rows){
  listEl.innerHTML = "";

  if (!rows.length){
    emptyEl.style.display = "block";
    if (pagerEl) pagerEl.innerHTML = "";
    return;
  }
  emptyEl.style.display = "none";

  const totalPages = Math.max(1, Math.ceil(rows.length / PER_PAGE));
  if (page > totalPages) page = totalPages;

  const start = (page - 1) * PER_PAGE;
  const sliced = rows.slice(start, start + PER_PAGE);

  sliced.forEach((r, idx) => {
    const li = document.createElement("li");
    li.className = "b-row";

    // ✅ 전체 최신글 1개만 N
    const isFirstOverall = (start + idx) === 0;
    const left = isFirstOverall
      ? `<span class="b-no b-badge">N</span>`
      : `<span class="b-no">${start + idx + 1}</span>`;

    li.innerHTML = `
      ${left}
      <a class="b-title" href="case_view.html?id=${r.id}">${esc(r.title) || "(제목 없음)"}</a>
      <span class="b-date">${fmtDate(r.createdAt)}</span>
      <span class="b-views">${r.views ?? 0}</span>
    `;
    listEl.appendChild(li);
  });

  renderPager(totalPages);
}

async function load(){
  const qy = query(
    collection(db, "posts"),
    where("category", "==", "case"),
    orderBy("createdAt", "desc"),
    limit(200)
  );

  const snap = await getDocs(qy);
  cached = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  render(cached);
}

await load();
