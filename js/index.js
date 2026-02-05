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
