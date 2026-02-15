import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore, doc, getDoc, updateDoc, increment,
  collection, getDocs, query, where, limit
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

// ✅ 필수 DOM
const titleEl = document.getElementById("title");
const metaEl = document.getElementById("meta");
const contentEl = document.getElementById("content");
const emptyEl = document.getElementById("empty");

// ✅ 변경된 이전/다음 링크 DOM
const prevLink = document.getElementById("prevLink");
const nextLink = document.getElementById("nextLink");

const fmtDate = (ts) => {
  if (!ts) return "-";
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}.${m}.${day}`;
};

// ✅ id 읽기
const idRaw = new URL(location.href).searchParams.get("id");
const id = idRaw ? decodeURIComponent(idRaw) : null;

// ✅ 링크 비활성화 유틸
function disableLink(a, text) {
  if (!a) return;
  a.textContent = text;
  a.removeAttribute("href");
  a.style.pointerEvents = "none";
  a.style.color = "#94a3b8";
}

function enableLink(a, href, text) {
  if (!a) return;
  a.textContent = text;
  a.setAttribute("href", href);
  a.style.pointerEvents = "";
  a.style.color = "";
}

if (!id) {
  if (emptyEl) emptyEl.style.display = "block";
  if (titleEl) titleEl.textContent = "잘못된 접근";
  disableLink(prevLink, "이전 글이 없습니다.");
  disableLink(nextLink, "다음 글이 없습니다.");
} else {
  const ref = doc(db, "posts", id);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    if (emptyEl) emptyEl.style.display = "block";
    if (titleEl) titleEl.textContent = "글을 찾을 수 없어요.";
    disableLink(prevLink, "이전 글이 없습니다.");
    disableLink(nextLink, "다음 글이 없습니다.");
  } else {
    const data = snap.data();

    // ✅ 본문 렌더
    if (titleEl) titleEl.textContent = data.title || "(제목 없음)";
    if (metaEl) {
      metaEl.innerHTML = `
        <span>등록일 ${fmtDate(data.createdAt)}</span>
        <span>조회 ${(data.views ?? 0) + 1}</span>
      `;
    }
    if (contentEl) contentEl.innerHTML = data.content || "";
    if (emptyEl) emptyEl.style.display = "none";

    // 조회수 +1 (실패해도 화면은 보여야 하니까 try)
    try { await updateDoc(ref, { views: increment(1) }); } catch(e){}

    // ✅ -------- 인덱스 없이 이전/다음 구하기 --------
    // orderBy 없이 category만 가져온 뒤 JS에서 정렬
    const navQ = query(
      collection(db, "posts"),
      where("category", "==", "case"),
      limit(300)
    );

    let docs = [];
    try {
      const navSnap = await getDocs(navQ);
      docs = navSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (e) {
      // nav 실패해도 본문은 보여야 함
      console.log("nav load fail:", e.message);
      disableLink(prevLink, "이전 글이 없습니다.");
      disableLink(nextLink, "다음 글이 없습니다.");
      // 여기서 끝
      docs = [];
    }

    // createdAt 최신순 정렬
    docs.sort((a, b) => {
      const at = a.createdAt?.toMillis ? a.createdAt.toMillis() : new Date(a.createdAt || 0).getTime();
      const bt = b.createdAt?.toMillis ? b.createdAt.toMillis() : new Date(b.createdAt || 0).getTime();
      return bt - at;
    });

    const curIndex = docs.findIndex(x => x.id === id);
    const prevPost = curIndex > 0 ? docs[curIndex - 1] : null;                 // 더 최신
    const nextPost = (curIndex >= 0 && curIndex < docs.length - 1) ? docs[curIndex + 1] : null; // 더 오래됨

    if (prevPost) {
      enableLink(prevLink, `case_view.html?id=${prevPost.id}`, prevPost.title || "(제목 없음)");
    } else {
      disableLink(prevLink, "이전 글이 없습니다.");
    }

    if (nextPost) {
      enableLink(nextLink, `case_view.html?id=${nextPost.id}`, nextPost.title || "(제목 없음)");
    } else {
      disableLink(nextLink, "다음 글이 없습니다.");
    }
  }
}
