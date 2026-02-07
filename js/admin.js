// ✅ Cloudinary 설정
const CLOUDINARY_CLOUD_NAME = "dvwxvyayo";
const CLOUDINARY_UPLOAD_PRESET = "youthit_unsigned";

// 파일 1개 업로드 → URL 반환
async function uploadToCloudinary(file) {
  const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

  const form = new FormData();
  form.append("file", file);
  form.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

  const res = await fetch(url, { method: "POST", body: form });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Cloudinary 업로드 실패: ${res.status} ${text}`);
  }

  const data = await res.json();
  return data.secure_url; // https URL
}

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  deleteDoc,
  doc,
  query,
  orderBy,
  updateDoc,   // ✅ 추가
  getDoc       // ✅ 추가(수정 시 안정성)
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// ✅ Firebase Config (Storage 필요 없음)
const firebaseConfig = {
  apiKey: "AIzaSyCyVedJuQp-WlVgxElhPLw87kBT_hbCy3k",
  authDomain: "youth-it-2e80e.firebaseapp.com",
  projectId: "youth-it-2e80e",
  messagingSenderId: "647500223077",
  appId: "1:647500223077:web:aaa5dd04468463173eec8c",
  measurementId: "G-LKD00C81X2"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// DOM
const loginBox = document.getElementById("loginBox");
const writeBox = document.getElementById("writeBox");
const loginMsg = document.getElementById("loginMsg");
const writeMsg = document.getElementById("writeMsg");
const adminList = document.getElementById("adminList");

const imageFile = document.getElementById("imageFile");
const preview = document.getElementById("preview");

const bodyImages = document.getElementById("bodyImages");
const btnInsertImages = document.getElementById("btnInsertImages");
const imgMsg = document.getElementById("imgMsg");
const contentEl = document.getElementById("content");

const btnSave = document.getElementById("btnSave");

// (선택) 수정 상태 안내 문구 넣고 싶으면 HTML에 <div id="editState"></div> 추가해서 사용
const editStateEl = document.getElementById("editState") || null;

const fmtDate = (ts) => {
  if (!ts) return "-";
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  });
};

// 대표 이미지 미리보기
imageFile.addEventListener("change", () => {
  const f = imageFile.files?.[0];
  if (!f) {
    preview.style.display = "none";
    preview.src = "";
    return;
  }
  preview.src = URL.createObjectURL(f);
  preview.style.display = "block";
});

// 커서 위치에 HTML 삽입
function insertAtCursor(textarea, text) {
  const start = textarea.selectionStart ?? textarea.value.length;
  const end = textarea.selectionEnd ?? textarea.value.length;
  textarea.value = textarea.value.slice(0, start) + text + textarea.value.slice(end);
  const nextPos = start + text.length;
  textarea.focus();
  textarea.selectionStart = textarea.selectionEnd = nextPos;
}

// ✅ 본문 이미지 여러 장 업로드 → content에 <img> 삽입 (Cloudinary)
btnInsertImages.addEventListener("click", async () => {
  const files = bodyImages.files ? Array.from(bodyImages.files) : [];
  if (!files.length) {
    imgMsg.textContent = "이미지를 먼저 선택해줘!";
    return;
  }

  imgMsg.textContent = "이미지 업로드 중...";
  btnInsertImages.disabled = true;

  try {
    for (const file of files) {
      const url = await uploadToCloudinary(file);
      const htmlBlock = `\n<img src="${url}" alt="" />\n<p class="cap"></p>\n`;
      insertAtCursor(contentEl, htmlBlock);
    }

    imgMsg.textContent = "본문에 이미지 삽입 완료!";
    bodyImages.value = "";
  } catch (e) {
    imgMsg.textContent = "이미지 삽입 실패: " + e.message;
  } finally {
    btnInsertImages.disabled = false;
  }
});

function setEditMode(isEdit, editId = "") {
  if (!btnSave) return;

  if (isEdit) {
    btnSave.dataset.editId = editId;
    btnSave.textContent = "수정 저장";
    if (editStateEl) editStateEl.textContent = "✏️ 수정 중입니다. 저장을 누르면 글이 업데이트됩니다.";
  } else {
    btnSave.dataset.editId = "";
    btnSave.textContent = "저장";
    if (editStateEl) editStateEl.textContent = "";
  }
}

function resetForm() {
  document.getElementById("title").value = "";
  document.getElementById("content").value = "";
  // 카테고리는 유지하고 싶으면 아래 줄 주석처리
  // document.getElementById("category").value = "case";

  imageFile.value = "";
  preview.style.display = "none";
  preview.src = "";

  bodyImages.value = "";
  imgMsg.textContent = "";
}

async function loadAdminPosts() {
  adminList.innerHTML = `<tr><td colspan="6" class="muted">불러오는 중...</td></tr>`;

  const qy = query(collection(db, "posts"), orderBy("createdAt", "desc"));
  const snap = await getDocs(qy);

  if (snap.empty) {
    adminList.innerHTML = `<tr><td colspan="6" class="muted">등록된 글이 없습니다.</td></tr>`;
    return;
  }

  adminList.innerHTML = "";
  snap.forEach((d) => {
    const data = d.data();
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${
        data.imageUrl
          ? `<img class="thumb" src="${data.imageUrl}" alt="">`
          : `<span class="muted">-</span>`
      }</td>
      <td>
        <a href="#" data-id="${d.id}" style="font-weight:900; text-decoration:underline;">
          ${data.title || "(제목 없음)"}
        </a>
        <div class="muted" style="margin-top:6px; display:none;" id="pv-${d.id}">
          ${(data.content || "")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .slice(0, 180)}${(data.content || "").length > 180 ? "..." : ""}
        </div>
      </td>
      <td class="muted">${data.category || "-"}</td>
      <td class="muted">${fmtDate(data.createdAt)}</td>
      <td class="muted">${data.views ?? 0}</td>
      <td>
        <button class="edit" data-edit="${d.id}">수정</button>
        <button class="danger" data-del="${d.id}">삭제</button>
      </td>
    `;

    // 미리보기 토글
    tr.querySelector("a").addEventListener("click", (e) => {
      e.preventDefault();
      const pv = document.getElementById(`pv-${d.id}`);
      pv.style.display = (pv.style.display === "none") ? "block" : "none";
    });

    // 삭제
    tr.querySelector("button[data-del]").addEventListener("click", async () => {
      if (!confirm("정말 삭제할까요? (되돌릴 수 없음)")) return;
      await deleteDoc(doc(db, "posts", d.id));
      await loadAdminPosts();

      // 삭제한 글이 수정중이었으면 수정모드 해제
      if (btnSave?.dataset.editId === d.id) setEditMode(false);
    });

    // 수정: 폼에 채우기
    tr.querySelector("button[data-edit]").addEventListener("click", async () => {
      // 최신 데이터로 채우고 싶으면 getDoc 한 번 더
      const ref = doc(db, "posts", d.id);
      const snapOne = await getDoc(ref);
      if (!snapOne.exists()) return;

      const fresh = snapOne.data();

      document.getElementById("category").value = fresh.category || "case";
      document.getElementById("title").value = fresh.title || "";
      document.getElementById("content").value = fresh.content || "";

      // 대표 이미지 미리보기는 "기존 URL" 그대로 보여주고 싶으면 아래처럼(선택)
      // file input에는 값 못 넣으니 preview만 보여주는 형태
      if (fresh.imageUrl) {
        preview.src = fresh.imageUrl;
        preview.style.display = "block";
      } else {
        preview.style.display = "none";
        preview.src = "";
      }

      setEditMode(true, d.id);
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    adminList.appendChild(tr);
  });
}

// 로그인 상태 UI
onAuthStateChanged(auth, (user) => {
  if (user) {
    loginBox.style.display = "none";
    writeBox.style.display = "block";
    loginMsg.textContent = "";
    loadAdminPosts();
  } else {
    loginBox.style.display = "block";
    writeBox.style.display = "none";
  }
});

// 로그인
document.getElementById("btnLogin").addEventListener("click", async () => {
  loginMsg.textContent = "로그인 시도중...";
  try {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    await signInWithEmailAndPassword(auth, email, password);
    loginMsg.textContent = "로그인 성공!";
  } catch (e) {
    loginMsg.textContent = "로그인 실패: " + e.message;
  }
});

// ✅ 저장: (수정중이면 updateDoc / 아니면 addDoc)
btnSave.addEventListener("click", async () => {
  writeMsg.textContent = "저장 중...";

  try {
    const category = document.getElementById("category").value;
    const title = document.getElementById("title").value.trim();
    const content = document.getElementById("content").value.trim();
    const file = imageFile.files?.[0] || null;

    if (!title || !content) {
      writeMsg.textContent = "제목과 내용을 입력해줘!";
      return;
    }

    // 대표 이미지 업로드(선택)
    let imageUrl = "";
    if (file) {
      imageUrl = await uploadToCloudinary(file);
    }

    const editId = btnSave.dataset.editId;

    // ✅ 수정 모드
    if (editId) {
      const ref = doc(db, "posts", editId);

      // file을 새로 올린 경우에만 imageUrl 갱신, 아니면 기존 유지
      const patch = {
        category,
        title,
        content
      };
      if (imageUrl) patch.imageUrl = imageUrl;

      await updateDoc(ref, patch);

      writeMsg.textContent = "수정 완료!";
      setEditMode(false);
    }
    // ✅ 새 글 작성
    else {
      await addDoc(collection(db, "posts"), {
        category,
        title,
        content,       // ✅ HTML 저장
        imageUrl,      // ✅ 대표 이미지 URL(Cloudinary) - 없으면 ""
        views: 0,
        createdAt: serverTimestamp()
      });

      writeMsg.textContent = "저장 완료!";
    }

    resetForm();
    await loadAdminPosts();
  } catch (e) {
    writeMsg.textContent = "저장 실패: " + e.message;
  }
});

// 로그아웃
document.getElementById("btnLogout").addEventListener("click", async () => {
  await signOut(auth);
  setEditMode(false);
});
