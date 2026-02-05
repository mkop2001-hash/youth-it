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


