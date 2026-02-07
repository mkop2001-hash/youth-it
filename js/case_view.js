import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
    import {
      getFirestore, doc, getDoc, updateDoc, increment,
      collection, getDocs, query, where, orderBy, limit
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

    const titleEl = document.getElementById("title");
    const metaEl = document.getElementById("meta");
    const contentEl = document.getElementById("content");
    const emptyEl = document.getElementById("empty");
    const prevBtn = document.getElementById("prevBtn");
    const nextBtn = document.getElementById("nextBtn");

    const fmtDate = (ts) => {
      if (!ts) return "-";
      const d = ts.toDate ? ts.toDate() : new Date(ts);
      const y = d.getFullYear();
      const m = String(d.getMonth()+1).padStart(2,"0");
      const day = String(d.getDate()).padStart(2,"0");
      return `${y}.${m}.${day}`;
    };

    const id = new URL(location.href).searchParams.get("id");
    const disableNav = () => { prevBtn.disabled = true; nextBtn.disabled = true; };

    if (!id) {
      emptyEl.style.display = "block";
      titleEl.textContent = "잘못된 접근";
      disableNav();
    } else {
      const ref = doc(db, "posts", id);
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        emptyEl.style.display = "block";
        titleEl.textContent = "글을 찾을 수 없어요.";
        disableNav();
      } else {
        const data = snap.data();

        titleEl.textContent = data.title || "(제목 없음)";
        metaEl.innerHTML = `
          <span>등록일 ${fmtDate(data.createdAt)}</span>
          <span>조회 ${(data.views ?? 0) + 1}</span>
        `;

        // ✅ HTML 렌더
        contentEl.innerHTML = data.content || "";

        // 조회수 +1
        try { await updateDoc(ref, { views: increment(1) }); } catch(e){}

        const createdAt = data.createdAt;
        if (!createdAt) disableNav();

        // 이전글(더 최신)
        const prevQ = query(
          collection(db, "posts"),
          where("category", "==", "case"),
          where("createdAt", ">", createdAt),
          orderBy("createdAt", "asc"),
          limit(1)
        );

        // 다음글(더 오래된)
        const nextQ = query(
          collection(db, "posts"),
          where("category", "==", "case"),
          where("createdAt", "<", createdAt),
          orderBy("createdAt", "desc"),
          limit(1)
        );

        let prevId = null;
        let nextId = null;

        try { (await getDocs(prevQ)).forEach(d => prevId = d.id); } catch(e){ console.log(e.message); }
        try { (await getDocs(nextQ)).forEach(d => nextId = d.id); } catch(e){ console.log(e.message); }

        if (prevId) {
          prevBtn.disabled = false;
          prevBtn.addEventListener("click", () => location.href = `case_view.html?id=${encodeURIComponent(prevId)}`);
        } else prevBtn.disabled = true;

        if (nextId) {
          nextBtn.disabled = false;
          nextBtn.addEventListener("click", () => location.href = `case_view.html?id=${encodeURIComponent(nextId)}`);
        } else nextBtn.disabled = true;
      }
    }