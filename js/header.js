console.log('header.js 연결됨');

let lastScrollY = 0;
const header = document.querySelector('.main-head');

window.addEventListener('scroll', () => {
  const currentScrollY = window.scrollY;

  // 🔝 최상단이면 무조건 보이게
  if (currentScrollY === 0) {
    header.classList.remove('is-hide', 'is-show');
    header.classList.add('is-top');
    return;
  }

  header.classList.remove('is-top');

  // ⬇️ 아래로 스크롤
  if (currentScrollY > lastScrollY) {
    header.classList.remove('is-show');
    header.classList.add('is-hide');
  }
  // ⬆️ 위로 스크롤
  else {
    header.classList.remove('is-hide');
    header.classList.add('is-show');
  }

  lastScrollY = currentScrollY;
});


(() => {
  const header = document.querySelector(".main-head");
  const panel = document.getElementById("navPanel");
  const navItems = document.querySelectorAll(".gnb [data-panel]");
  const panes = panel ? panel.querySelectorAll(".nav-pane") : [];

  if (!header || !panel || navItems.length === 0 || panes.length === 0) return;

  // 헤더 높이를 CSS 변수로 동기화 (패널 top 정확)
  const syncHeaderHeight = () => {
    const h = header.getBoundingClientRect().height;
    document.documentElement.style.setProperty("--header-offset", `${Math.ceil(h)}px`);
  };
  syncHeaderHeight();
  window.addEventListener("resize", syncHeaderHeight);

  const activatePane = (id) => {
    panes.forEach(p => p.classList.toggle("is-active", p.id === id));
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

  // PC: hover로 열기
  let closeTimer = null;
  const scheduleClose = () => {
    clearTimeout(closeTimer);
    closeTimer = setTimeout(closePanel, 140);
  };
  const cancelClose = () => clearTimeout(closeTimer);

  navItems.forEach((li) => {
    const targetId = li.getAttribute("data-panel");
    const link = li.querySelector("a");

    // 데스크탑 hover
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

    // 키보드 접근성 (탭 이동시)
    li.addEventListener("focusin", () => {
      if (window.matchMedia("(max-width: 959px)").matches) return;
      cancelClose();
      activatePane(targetId);
      openPanel();
    });

    // 모바일: 클릭 토글 (내용은 HTML 그대로)
    if (link) {
      link.addEventListener("click", (e) => {
        if (!window.matchMedia("(max-width: 959px)").matches) return;

        // 모바일에서는 링크 이동 대신 펼치기 (원하면 이 줄 삭제하고 그냥 이동하게 할 수도 있음)
        e.preventDefault();

        const isOpen = panel.classList.contains("is-open");
        const active = panel.dataset.active;

        if (isOpen && active === targetId) {
          closePanel();
        } else {
          activatePane(targetId);
          openPanel();
        }
      });
    }
  });

  // 패널 위에 마우스가 있으면 닫힘 취소
  panel.addEventListener("mouseenter", cancelClose);
  panel.addEventListener("mouseleave", () => {
    if (window.matchMedia("(max-width: 959px)").matches) return;
    scheduleClose();
  });

  // 바깥 클릭시 닫기
  document.addEventListener("click", (e) => {
    const inHeader = header.contains(e.target);
    const inPanel = panel.contains(e.target);
    if (!inHeader && !inPanel) closePanel();
  });

  // ESC 닫기
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closePanel();
  });
})();(() => {
  const openBtn = document.querySelector(".mnav-btn");
  const drawer = document.getElementById("mnavDrawer");
  const dim = document.getElementById("mnavDim");
  const closeBtn = drawer ? drawer.querySelector(".mnav-close") : null;

  if (!openBtn || !drawer || !dim || !closeBtn) return;

  const open = () => {
    document.body.classList.add("mnav-open");
    dim.hidden = false;
    drawer.setAttribute("aria-hidden", "false");
    openBtn.setAttribute("aria-expanded", "true");
  };

  const close = () => {
    document.body.classList.remove("mnav-open");
    drawer.setAttribute("aria-hidden", "true");
    openBtn.setAttribute("aria-expanded", "false");
    // dim은 fade-out 후 숨김
    setTimeout(() => { dim.hidden = true; }, 200);
  };

  openBtn.addEventListener("click", open);
  closeBtn.addEventListener("click", close);
  dim.addEventListener("click", close);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });

  // 화면이 커지면(데스크탑) 자동 닫기
  window.addEventListener("resize", () => {
    if (window.matchMedia("(min-width: 960px)").matches) close();
  });
})();

// 각 npHashAnim 요소마다 로티 하나씩 생성
document.querySelectorAll(".npHashAnim").forEach((container) => {
  const anim = lottie.loadAnimation({
    container,
    renderer: "svg",
    loop: true,
    autoplay: true,
    path: "lottie/hash.json"
  });

  // 원하면: 마우스 올릴 때만 다시 재생
  const pane = container.closest(".nav-pane") || container;
  pane.addEventListener("mouseenter", () => {
    anim.stop();
    anim.play();
  });
});