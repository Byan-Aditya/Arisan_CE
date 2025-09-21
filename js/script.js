// === JAM & TANGGAL ===
function updateDateTime() {
  const now = new Date();
  const options = {
    weekday: 'long', year: 'numeric', month: 'long',
    day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit'
  };
  const datetimeEl = document.getElementById('datetime');
  if (datetimeEl) {
    datetimeEl.textContent = now.toLocaleString('id-ID', options);
  }
}
setInterval(updateDateTime, 1000);
updateDateTime();

// === DARK MODE ===
(function(){
  const root = document.documentElement;
  const toggle = document.getElementById('themeToggle');

  const saved = localStorage.getItem('site-theme');
  if(saved==='dark') root.setAttribute('data-theme','dark');
  if(saved==='light') root.removeAttribute('data-theme');

  function setDark(dark){
    if(dark){
      root.setAttribute('data-theme','dark');
      localStorage.setItem('site-theme','dark');
    } else {
      root.removeAttribute('data-theme');
      localStorage.setItem('site-theme','light');
    }
  }

  toggle.addEventListener('click',()=>{
    const isDark = root.getAttribute('data-theme')==='dark';
    setDark(!isDark);
  });
})();
