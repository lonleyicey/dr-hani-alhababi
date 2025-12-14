
(function(){
  function updateThemeToggle(mode){
    const toggle = document.getElementById('themeToggle');
    if(!toggle) return;
    const dark = mode === 'dark';
    toggle.setAttribute('aria-pressed', dark ? 'true' : 'false');
    const en = toggle.querySelector('.en');
    const ar = toggle.querySelector('.ar');
    if(en) en.textContent = dark ? 'Switch to light mode' : 'Switch to dark mode';
    if(ar) ar.textContent = dark ? 'التبديل إلى الوضع الفاتح' : 'التبديل إلى الوضع الداكن';
  }

  function setTheme(mode){
    document.documentElement.setAttribute('data-theme', mode);
    updateThemeToggle(mode);
    try{ localStorage.setItem('siteTheme', mode);}catch(e){}
  }

  function initTheme(){
    let storedTheme = null;
    try{
      storedTheme = localStorage.getItem('siteTheme');
    }catch(e){}
    let savedTheme = storedTheme || 'light';
    if(savedTheme !== 'dark' && savedTheme !== 'light'){
      savedTheme = 'light';
    }
    if(!storedTheme && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches){
      savedTheme = 'dark';
    }
    setTheme(savedTheme);

    const toggle = document.getElementById('themeToggle');
    if(toggle){
      toggle.addEventListener('click', ()=>{
        const current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
        const next = current === 'dark' ? 'light' : 'dark';
        setTheme(next);
      });
    }

    if(window.matchMedia){
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = ev=>{
        let stored = null;
        try{ stored = localStorage.getItem('siteTheme'); }catch(e){}
        if(stored) return;
        setTheme(ev.matches ? 'dark' : 'light');
      };
      if(mq.addEventListener){
        mq.addEventListener('change', listener);
      } else if(mq.addListener){
        mq.addListener(listener);
      }
    }
  }

  function setLanguage(lang){
    document.querySelectorAll('.en').forEach(el => el.style.display = (lang==='en') ? '' : 'none');
    document.querySelectorAll('.ar').forEach(el => el.style.display = (lang==='ar') ? '' : 'none');
    document.documentElement.lang = lang;
    document.documentElement.dir  = (lang==='ar') ? 'rtl' : 'ltr';
    try{ localStorage.setItem('siteLang', lang);}catch(e){}
  }

  function initLang(){
    let saved='en';
    try{ saved = localStorage.getItem('siteLang') || 'en';}catch(e){}
    setLanguage(saved);
    document.querySelectorAll('[data-lang]').forEach(btn=>{
      btn.addEventListener('click', ()=> setLanguage(btn.getAttribute('data-lang')));
    });
  }

  function initSidebar(){
    const sidebar = document.getElementById('sidebar');
    const toggle = document.getElementById('sidebarToggle');
    if(!sidebar || !toggle) return;
    toggle.addEventListener('click', ()=> sidebar.classList.toggle('open'));
    // close when clicking a link on mobile
    sidebar.querySelectorAll('a').forEach(a=>{
      a.addEventListener('click', ()=>{
        if(window.matchMedia('(max-width: 980px)').matches){
          sidebar.classList.remove('open');
        }
      });
    });
  }

  function initSearch(){
    const input = document.getElementById('searchInput');
    if(!input) return;
    input.addEventListener('input', ()=>{
      const q = input.value.trim().toLowerCase();
      document.querySelectorAll('[data-searchable]').forEach(el=>{
        const txt = el.textContent.toLowerCase();
        el.style.display = txt.includes(q) ? '' : 'none';
      });
    });
  }

  function initComments(){
    const form = document.getElementById('commentForm');
    const list = document.getElementById('commentList');
    if(!form || !list) return;
    const emptyStates = document.querySelectorAll('.comment-list .empty-state');
    const storageKey = 'thesisComments';

    const loadComments = ()=>{
      try{
        return JSON.parse(localStorage.getItem(storageKey)) || [];
      }catch(e){
        return [];
      }
    };

    const saveComments = comments=>{
      try{
        localStorage.setItem(storageKey, JSON.stringify(comments));
      }catch(e){}
    };

    let comments = loadComments();

    const render = ()=>{
      list.innerHTML = '';
      if(!comments.length){
        emptyStates.forEach(el=> el.style.display = '');
        return;
      }
      emptyStates.forEach(el=> el.style.display = 'none');
      comments.forEach(comment=>{
        const li = document.createElement('li');
        li.className = 'comment';
        const header = document.createElement('header');
        const nameSpan = document.createElement('span');
        nameSpan.textContent = comment.author || 'Anonymous';
        const dateSpan = document.createElement('span');
        const date = comment.date ? new Date(comment.date) : new Date();
        dateSpan.textContent = date.toLocaleString();
        header.appendChild(nameSpan);
        header.appendChild(dateSpan);
        const body = document.createElement('p');
        body.textContent = comment.message;
        li.appendChild(header);
        li.appendChild(body);
        list.appendChild(li);
      });
    };

    form.addEventListener('submit', evt=>{
      evt.preventDefault();
      const author = (form.author?.value || '').trim();
      const message = (form.message?.value || '').trim();
      if(!message) return;
      const entry = {
        id: Date.now(),
        author: author || 'Anonymous',
        message,
        date: new Date().toISOString()
      };
      comments.unshift(entry);
      if(comments.length > 50){
        comments = comments.slice(0, 50);
      }
      saveComments(comments);
      render();
      form.reset();
    });

    render();
  }

  function initAll(){
    initTheme();
    initLang();
    initSidebar();
    initSearch();
    initComments();
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }
})();
