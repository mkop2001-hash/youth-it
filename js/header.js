console.log("header.js loaded", Date.now());

/* ==================================================
  0) 드로어 열릴 때 플로팅 숨김: body 클래스만 사용
  - display를 JS로 직접 만지지 않음 (꼬임 방지)
================================================== */
function setFloatingHidden(hidden) {
  document.body.classList.toggle("floating-hidden", hidden);
  if (hidden) closeQcMenu(); // 드로어 열리면 QC는 항상 닫기
}

/* ==================================================
  1) QC(견적문의) 열기/닫기 유틸
  - 핵심: hidden 속성까지 확실히 제거/복구
================================================== */
function openQcMenu() {
  const btn = document.querySelector(".qc-mfab");
  const menu = document.getElementById("qc-menu");
  if (!btn || !menu) return;

  // 모바일 드로어 열려있으면 QC 동작 금지
  if (document.body.classList.contains("mnav-open")) return;

  menu.hidden = false;
  menu.removeAttribute("hidden");

  btn.setAttribute("aria-expanded", "true");
  menu.setAttribute("aria-hidden", "false");
}

function closeQcMenu() {
  const btn = document.querySelector(".qc-mfab");
  const menu = document.getElementById("qc-menu");
  if (!btn || !menu) return;

  menu.hidden = true;
  menu.setAttribute("hidden", "");

  btn.setAttribute("aria-expanded", "false");
  menu.setAttribute("aria-hidden", "true");
}

function toggleQcMenu() {
  const menu = document.getElementById("qc-menu");
  if (!menu) return;
  if (menu.hidden) openQcMenu();
  else closeQcMenu();
}

/* ==================================================
  2) 헤더 스크롤 숨김/표시
================================================== */
(() => {
  let lastScrollY = 0;
  const header = document.querySelector(".main-head");
  if (!header) return;

  window.addEventListener("scroll", () => {
    const y = window.scrollY;

    if (y === 0) {
      header.classList.remove("is-hide", "is-show");
      header.classList.add("is-top");
      return;
    }

    header.classList.remove("is-top");

    if (y > lastScrollY) {
      header.classList.remove("is-show");
      header.classList.add("is-hide");
    } else {
      header.classList.remove("is-hide");
      header.classList.add("is-show");
    }

    lastScrollY = y;
  });
})();

/* ==================================================
  3) PC/Mobile 상단 네비 패널(hover/토글) - navPanel
================================================== */
(() => {
  const headerEl = document.querySelector(".main-head");
  const panel = document.getElementById("navPanel");
  const navItems = document.querySelectorAll(".gnb [data-panel]");
  const panes = panel ? panel.querySelectorAll(".nav-pane") : [];
  if (!headerEl || !panel || navItems.length === 0 || panes.length === 0) return;

  const syncHeaderHeight = () => {
    const h = headerEl.getBoundingClientRect().height;
    document.documentElement.style.setProperty("--header-offset", `${Math.ceil(h)}px`);
  };
  syncHeaderHeight();
  window.addEventListener("resize", syncHeaderHeight);

  const activatePane = (id) => {
    panes.forEach((p) => p.classList.toggle("is-active", p.id === id));
    panel.dataset.active = id;
  };

  const openPanel = () => {
    panel.classList.add("is-open");
    panel.setAttribute("aria-hidden", "false");
  };

  const closePanel = () => {
    panel.classList.remove("is-open");
    panel.setAttribute("aria-hidden", "true");
    panel.dataset.active = "";
  };

  let closeTimer = null;
  const scheduleClose = () => {
    clearTimeout(closeTimer);
    closeTimer = setTimeout(closePanel, 140);
  };
  const cancelClose = () => clearTimeout(closeTimer);

  navItems.forEach((li) => {
    const targetId = li.getAttribute("data-panel");
    const link = li.querySelector("a");

    li.addEventListener("mouseenter", () => {
      if (window.matchMedia("(max-width: 959px)").matches) return;
      cancelClose();
      activatePane(targetId);
      openPanel();
    });

    li.addEventListener("mouseleave", () => {
      if (window.matchMedia("(max-width: 959px)").matches) return;
      scheduleClose();
    });

    li.addEventListener("focusin", () => {
      if (window.matchMedia("(max-width: 959px)").matches) return;
      cancelClose();
      activatePane(targetId);
      openPanel();
    });

    if (link) {
      link.addEventListener("click", (e) => {
        if (!window.matchMedia("(max-width: 959px)").matches) return;

        e.preventDefault();

        const isOpen = panel.classList.contains("is-open");
        const active = panel.dataset.active;

        if (isOpen && active === targetId) closePanel();
        else {
          activatePane(targetId);
          openPanel();
        }
      });
    }
  });

  panel.addEventListener("mouseenter", cancelClose);
  panel.addEventListener("mouseleave", () => {
    if (window.matchMedia("(max-width: 959px)").matches) return;
    scheduleClose();
  });

  document.addEventListener("click", (e) => {
    const inHeader = headerEl.contains(e.target);
    const inPanel = panel.contains(e.target);
    if (!inHeader && !inPanel) closePanel();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closePanel();
  });
})();

/* ==================================================
  4) 모바일 햄버거 드로어 열기/닫기
  - 열리면: QC 닫기 + 플로팅 숨김
  - 닫히면: 플로팅 복원(기능 유지)
================================================== */
(() => {
  const openBtn = document.querySelector(".mnav-btn");
  const drawer = document.getElementById("mnavDrawer");
  const dim = document.getElementById("mnavDim");
  const closeBtn = drawer ? drawer.querySelector(".mnav-close") : null;
  if (!openBtn || !drawer || !dim || !closeBtn) return;

  const setDimActive = (active) => {
    dim.style.pointerEvents = active ? "auto" : "none";
  };
  if (dim.hidden) setDimActive(false);

  const open = () => {
    document.body.classList.add("mnav-open");
    dim.hidden = false;
    setDimActive(true);

    drawer.removeAttribute("inert");
    drawer.setAttribute("aria-hidden", "false");
    openBtn.setAttribute("aria-expanded", "true");

    setFloatingHidden(true); // ✅ QC 닫기 포함
    closeBtn.focus();
  };

  const close = () => {
    if (drawer.contains(document.activeElement)) openBtn.focus();

    document.body.classList.remove("mnav-open");

    drawer.setAttribute("aria-hidden", "true");
    drawer.setAttribute("inert", "");
    openBtn.setAttribute("aria-expanded", "false");

    setFloatingHidden(false);

    setTimeout(() => {
      dim.hidden = true;
      setDimActive(false);
    }, 200);
  };

  openBtn.addEventListener("click", (e) => { e.preventDefault(); open(); });
  closeBtn.addEventListener("click", (e) => { e.preventDefault(); close(); });
  dim.addEventListener("click", (e) => { e.preventDefault(); close(); });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });

  window.addEventListener("resize", () => {
    if (window.matchMedia("(min-width: 960px)").matches) close();
  });
})();

/* ==================================================
  5) QC(견적문의) 토글 - "직접 바인딩 + 캡처링"
  - 다른 스크립트의 document click보다 먼저 실행(캡처 단계)
  - 열리자마자 닫히는 현상 방지
================================================== */
(() => {
  const btn = document.querySelector(".qc-mfab");
  const menu = document.getElementById("qc-menu");
  if (!btn || !menu) return;

  // 초기 상태 정리
  closeQcMenu();

  const isDrawerOpen = () => document.body.classList.contains("mnav-open");

  // ✅ 버튼 클릭: 캡처링 단계에서 먼저 잡아서 토글
  btn.addEventListener(
    "click",
    (e) => {
      if (isDrawerOpen()) return;
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation(); // ✅ 다른 click 핸들러보다 강함
      toggleQcMenu();
    },
    true // ✅ capture
  );

  // ✅ X 버튼 클릭
  menu.addEventListener(
    "click",
    (e) => {
      const x = e.target.closest(".qc-close");
      if (!x) return;
      if (isDrawerOpen()) return;

      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      closeQcMenu();
    },
    true
  );

  // ✅ 메뉴 안 클릭은 유지 (밖클릭 로직에 의해 닫히는거 방지)
  menu.addEventListener(
    "click",
    (e) => {
      if (isDrawerOpen()) return;
      e.stopPropagation();
      e.stopImmediatePropagation();
    },
    true
  );

  // ✅ 바깥 클릭 닫기 (캡처링으로 안정화)
  document.addEventListener(
    "click",
    (e) => {
      if (isDrawerOpen()) return;

      if (menu.hidden) return;

      const insideMenu = e.target.closest("#qc-menu");
      const onBtn = e.target.closest(".qc-mfab");
      if (!insideMenu && !onBtn) closeQcMenu();
    },
    true
  );

  // ESC 닫기
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeQcMenu();
  });
})();


/* ==================================================
  6) 스크롤업 버튼
================================================== */
(() => {
  const btn = document.querySelector(".scroll-top");
  if (!btn) return;

  btn.addEventListener("click", () => {
    if (document.body.classList.contains("mnav-open")) return;
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
})();

/* ==================================================
  7) 로티
================================================== */
(() => {
  if (typeof lottie === "undefined") return;

  document.querySelectorAll(".npHashAnim").forEach((container) => {
    const anim = lottie.loadAnimation({
      container,
      renderer: "svg",
      loop: true,
      autoplay: true,
      path: "lottie/hash.json",
    });

    const pane = container.closest(".nav-pane") || container;
    pane.addEventListener("mouseenter", () => {
      anim.stop();
      anim.play();
    });
  });
})();
