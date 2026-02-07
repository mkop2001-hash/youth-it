import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit
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

/* =========================
   utils
========================= */
const escapeHTML = (s="") =>
  String(s).replace(/[&<>"']/g, (m) => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[m]));

/** Firestore Timestamp / ms 모두 처리 */
const toMs = (ts) => {
  if (!ts) return 0;
  if (typeof ts === "number") return ts;
  if (ts.toMillis) return ts.toMillis();
  if (ts.toDate) return ts.toDate().getTime();
  const d = new Date(ts);
  return isNaN(d.getTime()) ? 0 : d.getTime();
};

const isNewWithinDays = (createdAt, days = 3) => {
  const ms = toMs(createdAt);
  if (!ms) return false;
  const diff = Date.now() - ms;
  return diff >= 0 && diff <= days * 24 * 60 * 60 * 1000;
};

const pickThumb = (data={}) => {
  // 1순위: 명시적인 썸네일 필드
  const direct =
    data.thumb ||
    data.thumbnail ||
    data.image ||
    data.cover ||
    data.img;

  if (direct) return direct;

  // 2순위: content 안 첫 번째 이미지 추출
  if (data.content) {
    const div = document.createElement("div");
    div.innerHTML = data.content;
    const img = div.querySelector("img");
    if (img && img.src) {
      return img.src;
    }
  }

  // 3순위: 없음
  return "";
};

const fmtDate = (ts) => {
  if (!ts) return "-";
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}.${m}.${day}`;
};

const buildCardHTML = ({ title, summary, thumbUrl, isNew, createdAt, views }) => {
  const safeTitle = escapeHTML(title || "(제목 없음)");
  const safeSummary = escapeHTML(summary || "");

  const thumbHTML = thumbUrl
    ? `<img class="case-thumb-img" src="${thumbUrl}" alt="" loading="lazy">`
    : `<div class="case-thumb-ph" aria-hidden="true"></div>`;

  return `
    <div class="case-thumb">
      ${thumbHTML}
      ${isNew ? `<span class="case-badge-new">NEW</span>` : ``}
    </div>
    <div class="case-body">
      <h4 class="case-title">${safeTitle}</h4>
      <div class="case-sub">
        <span class="case-date">${fmtDate(createdAt)}</span>
        <span class="case-dot">·</span>
        <span class="case-views">조회 ${views ?? 0}</span>
      </div>
      ${safeSummary ? `<p class="case-desc">${safeSummary}</p>` : ``}
    </div>
  `;
};


const buildEmptyCardHTML = (index) => {
  // 글이 없거나 3개 미만일 때 보여줄 기본 카드
  const titles = [
    "매입 사례 업데이트 예정",
    "최근 매입 사례 준비 중",
    "곧 새로운 사례가 올라와요"
  ];
  const descs = [
    "실제 방문 수거/매입 사례를 순차적으로 공개합니다.",
    "기업·관공서 대량 매입 사례도 곧 업데이트됩니다.",
    "모델명/수량 보내주시면 빠른 견적 안내드려요."
  ];
  return `
    <div class="case-thumb">
      <div class="case-thumb-ph" aria-hidden="true"></div>
      <span class="case-badge-soon">SOON</span>
    </div>
    <div class="case-body">
      <h4 class="case-title">${titles[index] || titles[0]}</h4>
      <p class="case-desc">${descs[index] || descs[0]}</p>
    </div>
  `;
};

/* =========================
   main
========================= */
async function loadLatestCases(){
  const cards = [
    document.getElementById("caseCard1"),
    document.getElementById("caseCard2"),
    document.getElementById("caseCard3")
  ].filter(Boolean);

  if (!cards.length) return;

  // 로딩 상태(선택)
  cards.forEach((card, i) => {
    card.classList.add("is-loading");
    card.removeAttribute("href");
    card.innerHTML = buildEmptyCardHTML(i); // 로딩 중에도 깔끔하게
  });

  const qy = query(
    collection(db, "posts"),
    where("category", "==", "case"),
    orderBy("createdAt", "desc"),
    limit(3)
  );

  const snap = await getDocs(qy);
  const rows = snap.docs.map(d => ({ id: d.id, ...d.data() }));

  // 글이 아예 없으면: 3개 모두 기본 카드 + 목록으로 이동
  if (rows.length === 0) {
    cards.forEach((card, i) => {
      card.classList.remove("is-loading");
      card.href = "case.html"; // 목록 페이지로 이동
      card.innerHTML = buildEmptyCardHTML(i);
    });
    return;
  }

  // 글이 1~2개면: 나머지는 기본 카드로 채움
  cards.forEach((card, i) => {
    card.classList.remove("is-loading");

    const row = rows[i];
    if (!row) {
      card.href = "case.html";
      card.innerHTML = buildEmptyCardHTML(i);
      return;
    }

    const title = row.title || "(제목 없음)";
    const summary = row.summary || row.excerpt || ""; // 요약 필드 없으면 비워둠
    const thumbUrl = pickThumb(row);
    const newBadge = isNewWithinDays(row.createdAt, 3);

    card.href = `case_view.html?id=${encodeURIComponent(row.id)}`;
    card.innerHTML = buildCardHTML({
        title,
        summary,
        thumbUrl,
        isNew: newBadge,
        createdAt: row.createdAt,
        views: row.views
    });
  });
}

loadLatestCases();
