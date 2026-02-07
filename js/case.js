 import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
    import { getFirestore, collection, getDocs, query, where, orderBy, limit }
      from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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
    const qEl = document.getElementById("q");

    const fmtDate = (ts) => {
      if (!ts) return "-";
      const d = ts.toDate ? ts.toDate() : new Date(ts);
      const y = d.getFullYear();
      const m = String(d.getMonth()+1).padStart(2,"0");
      const day = String(d.getDate()).padStart(2,"0");
      return `${y}.${m}.${day}`;
    };

    let cached = [];

    function render(rows){
      listEl.innerHTML = "";
      const qtxt = qEl.value.trim().toLowerCase();
      const filtered = qtxt
        ? rows.filter(r => (r.title||"").toLowerCase().includes(qtxt) || (r.content||"").toLowerCase().includes(qtxt))
        : rows;

      if (!filtered.length){
        emptyEl.style.display = "block";
        return;
      }
      emptyEl.style.display = "none";

      filtered.forEach((r, idx) => {
        const li = document.createElement("li");
        li.className = "boardRow";
        li.innerHTML = `
          ${idx === 0 ? `<span class="boardBadgeN">N</span>` : `<span class="boardBadgeSpacer"></span>`}
          <a class="boardTit" href="case_view.html?id=${encodeURIComponent(r.id)}">${r.title || "(제목 없음)"}</a>
          <span class="boardDate">${fmtDate(r.createdAt)}</span>
          <span class="boardViews">${r.views ?? 0}</span>
        `;
        listEl.appendChild(li);
      });
    }

    async function load(){
      const qy = query(
        collection(db, "posts"),
        where("category", "==", "case"),
        orderBy("createdAt", "desc"),
        limit(80)
      );
      const snap = await getDocs(qy);
      cached = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      render(cached);
    }

    qEl.addEventListener("input", () => render(cached));
    await load();

