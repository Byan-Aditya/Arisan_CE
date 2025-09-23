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
  const metaTheme = document.querySelector('meta[name=theme-color]');
  const header = document.getElementById('header');

  function syncThemeColor() {
    if (!header || !metaTheme) return;
    const bg = getComputedStyle(header).backgroundColor;
    metaTheme.setAttribute('content', bg);
  }

  const saved = localStorage.getItem('site-theme');
  if(saved==='dark') root.setAttribute('data-theme','dark');
  if(saved==='light') root.removeAttribute('data-theme');
  syncThemeColor();

  function setDark(dark){
    if(dark){
      root.setAttribute('data-theme','dark');
      localStorage.setItem('site-theme','dark');
      metaTheme.setAttribute('content', '#000000'); // ireng pas dark
    } else {
      root.removeAttribute('data-theme');
      localStorage.setItem('site-theme','light');
      metaTheme.setAttribute('content', '#ffffff'); // putih pas light
    }
  }

  if (toggle) {
    toggle.addEventListener('click',()=>{
      const isDark = root.getAttribute('data-theme')==='dark';
      setDark(!isDark);
    });
  }

  if (header) {
    const observer = new MutationObserver(syncThemeColor);
    observer.observe(header, { attributes: true, attributeFilter: ["class","style"] });
  }
})();

// ===== AGGRESIVE ANTI-COPY / ANTI-SELECT / ANTI-SHORTCUT =====
(function(){
  // helper untuk hentikan event
  function stop(e){
    try{
      e.preventDefault && e.preventDefault();
      e.stopImmediatePropagation && e.stopImmediatePropagation();
      e.stopPropagation && e.stopPropagation();
      // some browsers expect returnValue = false
      if(typeof e.returnValue !== 'undefined') e.returnValue = false;
    }catch(err){}
    return false;
  }

  // disable selection via CSS on documentElement (fallback)
  try {
    const s = document.documentElement.style;
    s.userSelect = 'none';
    s.webkitUserSelect = 'none';
    s.msUserSelect = 'none';
    s.MozUserSelect = 'none';
    // mobile long press
    s.webkitTouchCallout = 'none';
  } catch(e){}

  // disable context menu
  document.addEventListener('contextmenu', stop, {capture:true});

  // disable selectionstart / mouse events (capture phase)
  document.addEventListener('selectstart', stop, {capture:true});
  document.addEventListener('mousedown', function(e){
    // allow clicks on controls if you want (example: allow on buttons)
    // if(e.target.closest && e.target.closest('button, a, input, textarea')) return;
    return stop(e);
  }, {capture:true});
  // pointer events (touch/pen)
  document.addEventListener('pointerdown', stop, {capture:true, passive:false});
  // touchstart for older mobile
  document.addEventListener('touchstart', stop, {capture:true, passive:false});

  // keyboard shortcuts: block Ctrl/Meta combos, F1-F12, Ctrl+Shift combos
  function blockKeys(e){
    const k = (e.key || '').toLowerCase();
    const ctrl = e.ctrlKey === true;
    const meta = e.metaKey === true; // mac command key
    const shift = e.shiftKey === true;

    // list of single-letter keys to block with ctrl/meta
    const blocked = ['c','x','v','u','s','a','p','i','j'];

    // block ctrl/meta + blocked letters
    if((ctrl || meta) && blocked.includes(k)){
      return stop(e);
    }
    // block ctrl+shift/meta+shift + i/j (devtools)
    if((ctrl && shift && ['i','j'].includes(k)) || (meta && shift && ['i','j'].includes(k))){
      return stop(e);
    }
    // block function keys F1-F12
    if(/^f\\d{1,2}$/i.test(e.key || '')) return stop(e);

    // optionally block PrintScreen or other keys (add here)
  }
  document.addEventListener('keydown', blockKeys, {capture:true});
  document.addEventListener('keyup', blockKeys, {capture:true});
  document.addEventListener('keypress', blockKeys, {capture:true});

  // disable clipboard operations
  document.addEventListener('copy', stop, {capture:true});
  document.addEventListener('cut', stop, {capture:true});
  document.addEventListener('paste', stop, {capture:true});

  // disable drag/drop
  document.addEventListener('dragstart', stop, {capture:true});
  document.addEventListener('drop', stop, {capture:true});

  // also intercept selection programmatically
  document.addEventListener('selectionchange', function(){
    try{
      const sel = document.getSelection();
      if(sel && sel.toString().length > 0) sel.removeAllRanges();
    }catch(e){}
  }, {capture:true});

  // Prevent text selection by double click
  document.addEventListener('dblclick', stop, {capture:true});

  // cover same-origin iframes (see section B)
  function applyToIframe(iframe){
    try{
      const win = iframe.contentWindow;
      if(!win) return;
      // send a message to the iframe to apply same policy (if it listens)
      try{ win.postMessage({type:'apply-no-select'}, '*'); }catch(e){}
      // if same-origin, directly inject CSS/style & handlers
      const doc = iframe.contentDocument;
      if(doc){
        const style = doc.createElement('style');
        style.textContent = `*{ -webkit-user-select:none!important; -moz-user-select:none!important; -ms-user-select:none!important; user-select:none!important; -webkit-touch-callout:none!important; }`;
        doc.head && doc.head.appendChild(style);
        // inject script to mirror handlers inside iframe
        const s2 = doc.createElement('script');
        s2.textContent = '('+initIframeHandlers.toString()+')()';
        doc.documentElement.appendChild(s2);
      }
    }catch(e){ /* cannot access cross-origin iframe */ }
  }

  // function string to inject inside same-origin iframe
  function initIframeHandlers(){
    // similar handlers but scoped to iframe document
    function stop(e){
      try{ e.preventDefault && e.preventDefault(); e.stopImmediatePropagation && e.stopImmediatePropagation(); if(typeof e.returnValue !== 'undefined') e.returnValue = false; }catch(e){}
      return false;
    }
    try{
      document.documentElement.style.userSelect='none';
      document.documentElement.style.webkitUserSelect='none';
      document.documentElement.style.webkitTouchCallout='none';
    }catch(e){}
    ['contextmenu','selectstart','mousedown','pointerdown','touchstart','dblclick'].forEach(ev=>{
      document.addEventListener(ev, stop, {capture:true});
    });
    ['copy','cut','paste','dragstart','drop'].forEach(ev=>{
      document.addEventListener(ev, stop, {capture:true});
    });
    document.addEventListener('keydown', function(e){
      const k=(e.key||'').toLowerCase(); const ctrl=e.ctrlKey; const meta=e.metaKey; const shift=e.shiftKey;
      const blocked=['c','x','v','u','s','a','p','i','j'];
      if((ctrl||meta)&&blocked.includes(k)) return stop(e);
      if((ctrl&&shift||meta&&shift)&&['i','j'].includes(k)) return stop(e);
      if(/^f\\d{1,2}$/i.test(e.key||'')) return stop(e);
    }, {capture:true});
    document.addEventListener('selectionchange', function(){ try{ const s=document.getSelection(); if(s && s.toString().length>0) s.removeAllRanges(); }catch(e){} }, {capture:true});
  }

  // apply to all iframes on load and dynamically added ones
  function applyToAllIframes(){
    document.querySelectorAll('iframe').forEach(applyToIframe);
  }
  window.addEventListener('load', applyToAllIframes);
  // observe DOM for added iframes
  const mo = new MutationObserver(muts=>{
    muts.forEach(m=>{
      m.addedNodes && m.addedNodes.forEach(n=>{
        if(n.tagName === 'IFRAME') applyToIframe(n);
        else if(n.querySelectorAll) n.querySelectorAll('iframe').forEach(applyToIframe);
      });
    });
  });
  mo.observe(document.documentElement || document.body, {childList:true, subtree:true});

})();

// === aplikasi===
const CACHE_NAME = "Arisan-cache-auto";

// file inti supaya offline bisa jalan
const PRECACHE_FILES = [
  "/index.html",
  "/css/style.css",
  "/css/dark_mode.css",
  "/js/script.js"
  // bisa tambah file inti lainnya
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_FILES))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(cachedRes => {
      if (cachedRes) return cachedRes;

      // dynamic caching: file baru otomatis masuk cache
      return fetch(event.request)
        .then(fetchRes => {
          if (event.request.url.startsWith("http") && fetchRes && fetchRes.status === 200 && fetchRes.type === "basic") {
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, fetchRes.clone()));
          }
          return fetchRes;
        })
        .catch(() => caches.match("/index.html")) // fallback offline
    })
  );
});
