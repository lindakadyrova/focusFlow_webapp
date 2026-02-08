let deferredPrompt;
const installBtn = document.getElementById("installBtn");

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  deferredPrompt = event;
  const installBtn = document.getElementById("installBtn");
  if (installBtn) {
    installBtn.style.display = "block";
  }
});

document.addEventListener("click", async (e) => {
  if (e.target && e.target.id === "installBtn") {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const result = await deferredPrompt.userChoice;
    console.log("Install choice:", result.outcome);
    
    e.target.style.display = "none";
    deferredPrompt = null;
  }
});

if (window.matchMedia('(display-mode: standalone)').matches) {
  console.log('PWA running in standalone mode');
}