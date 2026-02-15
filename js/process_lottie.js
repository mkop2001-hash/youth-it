function loadLottie(id, path){
  const el = document.getElementById(id);
  if (!el) return;

  lottie.loadAnimation({
    container: el,
    renderer: "svg",
    loop: true,
    autoplay: true,
    path: path
  });
}

loadLottie("icon-contact", "lottie/Communication.json");
loadLottie("icon-price", "lottie/price.json");
loadLottie("icon-pickup", "lottie/pickup.json");
loadLottie("icon-check", "lottie/Search.json");
loadLottie("icon-payment", "lottie/Check.json");
