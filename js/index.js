document.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('header');
  if (!header) return;

  const setHeaderHeight = () => {
    document.documentElement.style.setProperty(
      '--header-h',
      `${header.offsetHeight}px`
    );
  };

  setHeaderHeight();
  window.addEventListener('resize', setHeaderHeight);
});


function setViewportHeight() {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty("--vh", `${vh}px`);
}

window.addEventListener("resize", setViewportHeight);
setViewportHeight();

// 방문 수거 사례 Swiper
const casesSwiper = new Swiper('.cases-swiper', {
  slidesPerView: 1.1,
  spaceBetween: 12,
  centeredSlides: false,
  grabCursor: true,

  pagination: {
    el: '.cases-swiper .swiper-pagination',
    clickable: true
  },

  breakpoints: {
    640: {
      slidesPerView: 2,
      spaceBetween: 14
    },
    960: {
      slidesPerView: 3,
      spaceBetween: 14
    }
  }
});

document.addEventListener("DOMContentLoaded", function () {
  const mFab = document.querySelector(".qc-mfab");   // 빠른상담 버튼
  const mMenu = document.querySelector("#qc-menu");  // 메뉴
  const mClose = document.querySelector(".qc-close"); // 닫기 버튼

  if (!mFab || !mMenu) return;

  function openMenu() {
    mMenu.hidden = false;
    mFab.setAttribute("aria-expanded", "true");
  }

  function closeMenu() {
    mMenu.hidden = true;
    mFab.setAttribute("aria-expanded", "false");
  }

  // 버튼 클릭 → 토글
  mFab.addEventListener("click", function () {
    const isOpen = mFab.getAttribute("aria-expanded") === "true";
    isOpen ? closeMenu() : openMenu();
  });

  // 닫기 버튼 클릭
  if (mClose) {
    mClose.addEventListener("click", closeMenu);
  }

  // 메뉴 밖 클릭 시 닫기
  document.addEventListener("click", function (e) {
    if (
      !mMenu.hidden &&
      !e.target.closest("#qc-menu") &&
      !e.target.closest(".qc-mfab")
    ) {
      closeMenu();
    }
  });
});

// 스크롤 업 버튼
const scrollBtn = document.querySelector(".scroll-top");

if (scrollBtn) {
  window.addEventListener("scroll", () => {
    if (window.scrollY > 300) {
      scrollBtn.classList.add("is-show");
    } else {
      scrollBtn.classList.remove("is-show");
    }
  });

  scrollBtn.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  });
}

// INFO Tabs (FAQ / TIPS) + Height locked to TIPS
(function(){
  const tabFaq   = document.getElementById("tabFaq");
  const tabTips  = document.getElementById("tabTips");
  const panelFaq = document.getElementById("tabPanelFaq");
  const panelTips= document.getElementById("tabPanelTips");
  const panelsWrap = document.querySelector(".info-tabs .tab-panels");

  // 추가: 타이틀/설명 요소
  const infoTitle = document.getElementById("infoTitle");
  const infoDesc  = document.getElementById("infoDesc");

  if(!tabFaq || !tabTips || !panelFaq || !panelTips || !panelsWrap) return;

  function activate(which){
    const isFaq = which === "faq";

    // 버튼 상태
    tabFaq.classList.toggle("is-active", isFaq);
    tabTips.classList.toggle("is-active", !isFaq);
    tabFaq.setAttribute("aria-selected", String(isFaq));
    tabTips.setAttribute("aria-selected", String(!isFaq));

    // 패널 표시
    panelFaq.hidden = !isFaq;
    panelTips.hidden = isFaq;

    // ✅ 타이틀/설명 텍스트 변경
    if (infoTitle && infoDesc) {
      if (isFaq) {
        infoTitle.textContent = "FAQ";
        infoDesc.textContent = "매입 전 고객님들이 가장 많이 궁금해하시는 내용을 정리했습니다.";
      } else {
        infoTitle.textContent = "TIP";
        infoDesc.textContent = "조금만 신경 쓰면 더 좋은 조건으로 매입받을 수 있습니다.";
      }
    }
  }

  function lockPanelsHeightToTips(){
    const wasHidden = panelTips.hidden;
    if (wasHidden) panelTips.hidden = false;

    const h = panelTips.scrollHeight;
    if (h > 0) panelsWrap.style.height = h + "px";

    if (wasHidden) panelTips.hidden = true;
  }

  tabFaq.addEventListener("click", () => activate("faq"));
  tabTips.addEventListener("click", () => activate("tips"));

  activate("faq");

  window.addEventListener("load", lockPanelsHeightToTips);
  window.addEventListener("resize", lockPanelsHeightToTips);
})();

// FAQ: 하나만 열리게 하는 아코디언 동작
(function(){
  const faqItems = document.querySelectorAll(".faq-item");

  faqItems.forEach(item => {
    item.addEventListener("toggle", function(){
      if (item.open) {
        faqItems.forEach(other => {
          if (other !== item) {
            other.open = false;
          }
        });
      }
    });
  });
})();

