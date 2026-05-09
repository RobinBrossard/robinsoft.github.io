/* Lightweight client-side i18n loader
   - resources live under /i18n/{lang}.json (e.g. en.json, zh_CN.json)
   - default language: en
   - supports lang via URL param ?lang=xx, localStorage, navigator.language
   - updates elements with data-i18n attributes
*/
(function(){
  const DEFAULT = 'en';
  const SUPPORTED = ['en','zh_CN','zh_TW','fr'];
  function normalizeLang(l){
    if(!l) return DEFAULT;
    l = l.replace('-', '_');
    if(SUPPORTED.includes(l)) return l;
    // map short codes
    if(l.startsWith('zh')){
      if(l.toLowerCase().includes('tw')||l.toLowerCase().includes('hk')||l.includes('_TW')) return 'zh_TW';
      return 'zh_CN';
    }
    if(l.startsWith('fr')) return 'fr';
    if(l.startsWith('en')) return 'en';
    return DEFAULT;
  }

  // determine base path for i18n resources relative to this script or document
  function resourceBase(){
    // try to find the current script's src to compute base
    try{
      const scripts = document.getElementsByTagName('script');
      for(let i=scripts.length-1;i>=0;i--){
        const s = scripts[i];
        if(!s.src) continue;
        // look for i18n.js in src
        if(s.src.indexOf('i18n.js') !== -1){
          return s.src.replace(/\/js\/i18n.js$/, '/i18n/').replace(/\/js\/i18n.js$/, '/i18n/');
        }
      }
    }catch(e){/* ignore */}
    // fallback: use current document path
    const basePath = (location.pathname && location.pathname.indexOf('/')===0) ? location.pathname.replace(/[^/]*$/, '') : '/';
    return basePath + 'i18n/';
  }

  async function loadResource(lang){
    const base = resourceBase();
    const path = base + lang + '.json';
    try{
      const res = await fetch(path, {cache: 'no-store'});
      if(!res.ok) throw new Error('fetch failed: ' + res.status + ' ' + res.statusText);
      return await res.json();
    }catch(e){
      console.error('i18n: failed to load', path, e && e.message ? e.message : e);
      if(lang !== DEFAULT){
        return loadResource(DEFAULT);
      }
      return {};
    }
  }

  function resolveKey(obj, key){
    if(!obj || !key) return undefined;
    return key.split('.').reduce((o,k)=> (o && o[k]!==undefined) ? o[k] : undefined, obj);
  }

  function applyResource(res){
    document.querySelectorAll('[data-i18n]').forEach(function(el){
      const key = el.getAttribute('data-i18n');
      const txt = key.split('.').reduce((o,k)=> (o && o[k]!==undefined) ? o[k] : undefined, res);
      if(txt !== undefined){
        // allow HTML in translations
        el.innerHTML = txt;
      }
    });
  }

  function getLangFromUrl(){
    try{
      const p = new URLSearchParams(window.location.search);
      return p.get('lang');
    }catch(e){return null}
  }

  async function setLang(lang){
    lang = normalizeLang(lang);
    window.i18n = window.i18n || {};
    window.i18n.currentLang = lang;
    localStorage.setItem('site_lang', lang);
    const res = await loadResource(lang);
    applyResource(res);
    document.documentElement.lang = lang.replace('_','-');
    // update select if present
    const sel = document.getElementById('langSelect');
    if(sel) sel.value = lang;
    // update title if translation provided
    const titleKey = (window.i18n && window.i18n.pageTitleKey) ? window.i18n.pageTitleKey : 'title';
    const titleValue = titleKey === 'title' ? (res && res.title) : resolveKey(res, titleKey);
    if(titleValue !== undefined) document.title = titleValue;
  }

  // init
  document.addEventListener('DOMContentLoaded', function(){
    const urlLang = getLangFromUrl();
    const stored = localStorage.getItem('site_lang');
    const nav = navigator.language || navigator.userLanguage;
    const pick = urlLang || stored || nav || DEFAULT;
    setLang(pick);
    // expose setter
    window.i18n = window.i18n || {};
    window.i18n.setLang = setLang;
    window.i18n.currentLang = normalizeLang(pick);
  });

})();
