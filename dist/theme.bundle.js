(()=>{"use strict";var e,t,s,d;!function(e){e.LIGHT="light",e.DARK="dark",e.SYSTEM="system"}(e||(e={})),(s=t||(t={})).POPUP="popup",s.SIDE_PANEL="side-panel",e.SYSTEM,t.POPUP,d=function(t){if(document.body.classList.remove("light-theme","dark-theme"),t===e.LIGHT)document.body.classList.add("light-theme");else if(t===e.DARK)document.body.classList.add("dark-theme");else if(t===e.SYSTEM){const t=window.matchMedia("(prefers-color-scheme: dark)").matches?e.DARK:e.LIGHT;document.body.classList.add(`${t}-theme`)}},function(e,t){chrome.storage.sync.get(e,t)}({theme:e.SYSTEM},(({theme:t})=>{t||(t=e.SYSTEM),d(t)}))})();