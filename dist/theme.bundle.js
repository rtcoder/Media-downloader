(()=>{"use strict";var e,t,s,o,i;(i=e||(e={})).IMAGE="image",i.AUDIO="audio",i.VIDEO="video",function(e){e.LIGHT="light",e.DARK="dark",e.SYSTEM="system"}(t||(t={})),(o=s||(s={})).POPUP="popup",o.SIDE_PANEL="side-panel";const d={theme:t.SYSTEM,defaultAction:s.POPUP,previousVersion:null,showChangelogLink:!1,lastOpenSection:e.IMAGE,filters:{},filtersOpen:!1};var a;Object.keys(d),a=function(e){if(document.body.classList.remove("light-theme","dark-theme"),e===t.LIGHT)document.body.classList.add("light-theme");else if(e===t.DARK)document.body.classList.add("dark-theme");else if(e===t.SYSTEM){const e=window.matchMedia("(prefers-color-scheme: dark)").matches?t.DARK:t.LIGHT;document.body.classList.add(`${e}-theme`)}},function(e,t){chrome.storage.sync.get(e,t)}({theme:t.SYSTEM},(({theme:e})=>{e||(e=d.theme),a(e)}))})();
//# sourceMappingURL=theme.bundle.js.map