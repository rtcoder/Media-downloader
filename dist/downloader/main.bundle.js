(()=>{"use strict";var t;!function(t){t.IMAGE="image",t.AUDIO="audio",t.VIDEO="video"}(t||(t={}));var e,n,i,o,r=function(t,e,n,i){return new(n||(n=Promise))((function(o,r){function c(t){try{a(i.next(t))}catch(t){r(t)}}function s(t){try{a(i.throw(t))}catch(t){r(t)}}function a(t){var e;t.done?o(t.value):(e=t.value,e instanceof n?e:new n((function(t){t(e)}))).then(c,s)}a((i=i.apply(t,e||[])).next())}))};function c(){return r(this,void 0,void 0,(function*(){var t,e;try{let n={active:!0,lastFocusedWindow:!0},[i]=yield chrome.tabs.query(n);return!(null==i?void 0:i.url)||(null===(t=null==i?void 0:i.url)||void 0===t?void 0:t.startsWith("chrome://"))||(null===(e=null==i?void 0:i.url)||void 0===e?void 0:e.startsWith("https://chromewebstore.google.com"))?null:i}catch(t){return null}}))}function s(t){return r(this,void 0,void 0,(function*(){var e,n;try{const i=yield chrome.tabs.get(t);return chrome.runtime.lastError?(console.error("Error get tab by ID:",chrome.runtime.lastError),null):!(null==i?void 0:i.url)||(null===(e=null==i?void 0:i.url)||void 0===e?void 0:e.startsWith("chrome://"))||(null===(n=null==i?void 0:i.url)||void 0===n?void 0:n.startsWith("https://chromewebstore.google.com"))?null:i}catch(t){return null}}))}function a(t,e){chrome.storage.sync.get(t,e)}function l(t,e){e?chrome.storage.sync.set(t,e):chrome.storage.sync.set(t)}(o=e||(e={})).LIGHT="light",o.DARK="dark",o.SYSTEM="system",(i=n||(n={})).POPUP="popup",i.SIDE_PANEL="side-panel";const d={theme:e.SYSTEM,defaultAction:n.POPUP,previousVersion:null,showChangelogLink:!1,lastOpenSection:t.IMAGE,filters:{},filtersOpen:!1};function u(t,e,n=null){let i=[];i="string"==typeof t?function(t){const e=[],n=document.querySelectorAll(t);return n.forEach((t=>e.push(t))),n}(t):Array.isArray(t)?[...t]:[t],i.length&&(null===n?[...i].forEach((t=>{t.classList.contains(e)?t.classList.remove(e):t.classList.add(e)})):n?[...i].forEach((t=>t.classList.add(e))):[...i].forEach((t=>t.classList.remove(e))))}function f(t,e={},n=[]){const i=document.createElement(t);if(e.class&&("string"==typeof e.class?i.classList.add(e.class):i.classList.add(...e.class)),e.html&&(i.innerHTML=e.html||""),e.attributes)for(const[t,n]of Object.entries(e.attributes))i.setAttribute(t,n);if(e.data)for(const[t,n]of Object.entries(e.data))i.setAttribute(`data-${t}`,n);return e.type&&(i.type=e.type),e.title&&(i.title=e.title),e.alt&&(i.alt=e.alt),e.src&&(i.src=e.src),e.href&&(i.href=e.href),n&&(!Array.isArray(n)&&n instanceof HTMLElement&&(n=[n]),i.append(...n)),i}function h(t={},e=[]){return f("div",t,e)}function p(t={},e=[]){return f("span",t,e)}function m(t={},e=[]){return t.type="button",f("button",t,e)}function v(t={}){return f("img",t)}function y(t,e=24){return p({html:t,class:"x-icon",attributes:{size:e}})}function b(t){const e="string"==typeof t?E(t):t;e&&(e.hidden=!1)}function g(t){const e="string"==typeof t?E(t):t;e&&(e.hidden=!0)}function E(t){return document.querySelector(t)}Object.keys(d);const A=[],I={},T={},x=[],w=(()=>{let t;const e=[];for(let n=0;n<256;n++){t=n;for(let e=0;e<8;e++)t=1&t?3988292384^t>>>1:t>>>1;e[n]=t}return e})();function C(t){return function(t){let e=-1;for(let n=0;n<t.length;n++)e=e>>>8^w[255&(e^t.charCodeAt(n))];return~e>>>0}(t.toString()).toString(16).padStart(8,"0")}function O(){return E(".section-buttons button.selected").getAttribute("data-section")||t.IMAGE}function D(t,e){return t.order-e.order}const S={minWidth:null,maxWidth:null,minHeight:null,maxHeight:null,imageType:[],videoQuality:[],videoType:[],audioType:[]};function L(){["minWidth","maxWidth","minHeight","maxHeight"].forEach((t=>{E(`input#${t}`).value=S[t]})),["imageType","videoQuality","videoType","audioType"].forEach((t=>{const e=E(`select#${t}`),n=S[t],i=e.closest(".label-group").querySelector(".chips");i.innerHTML="",n.forEach((t=>{const e=M(t);i.appendChild(e)}))}))}function M(t){return h({class:"chip"},[p({html:t}),y("close")])}function H(){l({filters:S}),k(),P()}function k(){u(".open-filters","active-filters",function(e){const n={[t.IMAGE]:["minWidth","maxWidth","minHeight","maxHeight","imageType"],[t.VIDEO]:["videoType","videoQuality"],[t.AUDIO]:["audioType"]};return Object.keys(S).filter((t=>n[e].includes(t))).some((t=>{var e;return!!(null===(e=S[t])||void 0===e?void 0:e.length)}))}(O()))}function _(){return S}function $(){return h({class:"thumbnail"})}function q(e,n,i,o,r){const c=e.querySelector(".accordion-body")||h({class:"accordion-body"});if(r)c.appendChild(function(t){return t.querySelector(".yt-info")||h({class:"yt-info"},[p({html:"Note: Chrome Web Store does not allow extensions that download videos from YouTube any longer."}),f("a",{href:"https://developer.chrome.com/docs/webstore/troubleshooting/#prohibited-products",html:"Chrome policy"})])}(c)),c.classList.add("restricted");else{c.querySelectorAll(".grid-item").forEach((t=>t.hidden=!0));const e=n.sort(D).map((e=>function(e,n){const i=e.querySelector(`[data-item-idx="${n.itemIndex}"]`);if(i)return i.hidden=!n.display,i;const o=h({class:["grid-item",...n.selected?["checked"]:[]],attributes:{"data-item-idx":n.itemIndex}});o.hidden=!n.display;const r=m({class:"download_image_button"},y("download")),c=f("a",{attributes:{href:n.src,download:""}},r),s=p({class:"item-details-dimensions"}),a=p({class:"item-details-ext",html:n.extension}),l=p({class:"item-details-duration"});let d=null;switch(n.type){case t.IMAGE:s.textContent=`${n.properties.width} x ${n.properties.height}`,d=function(t){const e=$(),n=v({src:t});return e.appendChild(n),e}(n.src);break;case t.AUDIO:l.textContent=n.properties.durationStr,d=function(){const t=$(),e=y("music_note",50);return t.appendChild(e),t}();break;case t.VIDEO:l.textContent=n.properties.durationStr,s.textContent=n.properties.quality,d=function(t){const e=$(),n=y("videocam",50),i=v({src:t});return e.appendChild(t?i:n),e}(n.poster)}return o.appendChild(c),o.appendChild(a),o.appendChild(s),o.appendChild(l),d&&o.appendChild(d),o}(c,e)));c.append(...e)}return c}function W(e,n){const{title:i,uuid:o,id:r,favIconUrl:c,isRestricted:s}=e,a=O(),l=function(e,n){return e===t.IMAGE?function(t){const e=_();return t.map((t=>{var n;t.display=!0;const{width:i,height:o}=t.properties;return e.maxWidth&&i>e.maxWidth&&(t.display=!1),e.minWidth&&i<e.minWidth&&(t.display=!1),e.minHeight&&o<e.minHeight&&(t.display=!1),e.maxHeight&&o>e.maxHeight&&(t.display=!1),(null===(n=e.imageType)||void 0===n?void 0:n.length)&&!e.imageType.includes(t.extension)&&(t.display=!1),t}))}(n):e===t.AUDIO?function(t){const e=_();return t.map((t=>{var n;return t.display=!0,(null===(n=e.audioType)||void 0===n?void 0:n.length)&&!e.audioType.includes(t.extension)&&(t.display=!1),t}))}(n):e===t.VIDEO?function(t){const e=_();return t.map((t=>{var n,i;return t.display=!0,(null===(n=e.videoQuality)||void 0===n?void 0:n.length)&&!e.videoQuality.includes(t.properties.quality)&&(t.display=!1),(null===(i=e.videoType)||void 0===i?void 0:i.length)&&!e.videoType.includes(t.extension)&&(t.display=!1),t}))}(n):n.map((t=>(t.display=!0,t)))}(a,U(o,a)),d=j(o),u=n||h({class:["accordion-item",...d?["active"]:[]]});u.setAttribute("tab-uuid",o),u.classList.remove("first-item");const f=function(t,e,n,i){const o=i.length,r=i.filter((t=>t.display)).length,c=r===o?`(${r})`:`(${r} / ${o})`;t.hidden=0===r;const s=t.querySelector(".accordion-header");return s?(s.querySelector(".tab-media-count").innerHTML=c,s):h({class:"accordion-header"},m({class:"accordion-button"},[v({src:e,class:"favicon",alt:"Favicon"}),p({class:"tab-title"},[p({class:"title",html:n}),p({class:"tab-media-count",html:c})]),p({class:"tab-toggle"})]))}(u,c,i,l),y=q(u,l,0,0,s);return u.appendChild(f),u.appendChild(y),u}function U(t,e){let n=A;return e&&(n=n.filter((t=>t.type===e))),t&&(n=n.filter((e=>e.tabUuid===t))),n}function P(){!function(){const t=E(".accordion");x.forEach((e=>{const n=t.querySelector(`[data-tab-subgroup="${e}"]`);t.appendChild(function(t,e){e||(e=h({class:"accordion-group",attributes:{"data-tab-subgroup":t}})),function(t){return Object.values(T).filter((e=>e.id===t))}(t).forEach((t=>{const n=e.querySelector(`[tab-uuid="${t.uuid}"]`);e.appendChild(W(t,n))}));const n=Array.from(e.querySelectorAll(".accordion-item")).find((t=>!t.hasAttribute("hidden")));return n&&n.classList.add("first-item"),e}(e,n))}))}()}function G(t,e){I[t]=e}function j(t){return I[t]}const B=[t.IMAGE,t.AUDIO,t.VIDEO];function R(){let t=!0;const e=U();let n=0;for(let i=0;i<e.length;i++)e[i].selected&&(t=!1,n++);var i;E("#download-btn .selected-count").innerHTML=n>0?`(${n})`:"",i=!n,E("#download-btn").disabled=i}function V(t=0){setTimeout((()=>{const t=E(".top").getBoundingClientRect().height;document.body.style.setProperty("--topContainerHeight",`${t}px`)}),t)}function N(e){l({lastOpenSection:e=B.includes(e)?e:t.IMAGE}),u(".section-buttons button","selected",!1),u(`.section-buttons button[data-section="${e}"]`,"selected",!0);const n=E(".filters");n.classList.remove(t.IMAGE,t.AUDIO,t.VIDEO),n.classList.add(e),k(),V(),R()}function Q(t=null){!function(t){r(this,arguments,void 0,(function*(t,e=null){if(!e){const t=yield c();if(!t||!t.id)return;if(t.id<=0)return;e=t.id}yield chrome.scripting.executeScript({target:{tabId:e,allFrames:!0},files:[t]})}))}("/dist/content-script/send_media/send_media.bundle.js",t)}var F;!function(t){t.TAB_CREATED="tabCreated",t.TAB_REPLACED="tabReplaced",t.TAB_UPDATED="tabUpdated",t.TAB_ACTIVATED="tabActivated",t.SEND_MEDIA="sendMedia",t.QUICK_SEND_MEDIA_FOR_DOWNLOAD="quickSendMediaForDownload",t.GET_TAB_INFO="getTabInfo",t.THEME_CHANGED="themeChanged"}(F||(F={}));const Y=["https://youtube.com","https://www.youtube.com"];function K(t){return Y.some((e=>t.includes(e)))}function z(t){const e=t.id,n=C(`${e}-${t.url}`);T[n]={id:e,favIconUrl:t.favIconUrl,url:t.url,title:t.title,isRestricted:K(t.url),uuid:n},x.includes(e)||x.push(e)}const J={};function X(t){return e=this,n=void 0,o=function*(){if(t.error&&Object.keys(t.error).length>0)return void console.log(t);const e=J[t.jobHash]||(yield c());if(!e)return;J[t.jobHash]=e,z(e);const n=C(`${e.id}-${e.url}`);K(e.url)||(t.media.map((t=>(t.tabId=e.id,t.tabUuid=n,t.itemIndex=`${e.id}-${n}-${t.uuid}`,t))).forEach((t=>{A.find((e=>e.itemIndex===t.itemIndex))||A.push(t)})),B.forEach((t=>{const e=A.filter((e=>e.type===t)).length;E(`.section-buttons button[data-section="${t}"] .items-count`).innerHTML=e.toString()}))),P()},new((i=void 0)||(i=Promise))((function(t,r){function c(t){try{a(o.next(t))}catch(t){r(t)}}function s(t){try{a(o.throw(t))}catch(t){r(t)}}function a(e){var n;e.done?t(e.value):(n=e.value,n instanceof i?n:new i((function(t){t(n)}))).then(c,s)}a((o=o.apply(e,n||[])).next())}));var e,n,i,o}var Z,tt=function(t,e,n,i){return new(n||(n=Promise))((function(o,r){function c(t){try{a(i.next(t))}catch(t){r(t)}}function s(t){try{a(i.throw(t))}catch(t){r(t)}}function a(t){var e;t.done?o(t.value):(e=t.value,e instanceof n?e:new n((function(t){t(e)}))).then(c,s)}a((i=i.apply(t,e||[])).next())}))};Q(),function(){var t;t=(t,e,n)=>{const{eventName:i,data:o}=t;switch(i){case F.TAB_UPDATED:o.tabId,r=o.changeInfo,z(c=o.tab),c.active&&"complete"===r.status&&Q(c.id);break;case F.TAB_ACTIVATED:!function(t){tt(this,void 0,void 0,(function*(){const e=yield s(t);e&&(z(e),e.active&&Q(t))}))}(o.tabId);break;case F.TAB_CREATED:!function(t){z(t),t.active&&Q(t.id)}(o.tab);break;case F.TAB_REPLACED:!function(t){tt(this,void 0,void 0,(function*(){const e=yield s(t);e&&(z(e),e.active&&Q(t))}))}(o.tabId);break;case F.SEND_MEDIA:X(o)}var r,c;n(null)},chrome.runtime.onMessage.addListener(t)}(),document.body.addEventListener("click",(t=>{const{target:e}=t;if(e)if(e.closest("#download-btn"))U().filter((t=>t.selected)).forEach((t=>function(t){const e={url:t};chrome.downloads.download(e)}(t.src)));else{if(e.closest(".section-buttons button"))return N(e.closest(".section-buttons button").getAttribute("data-section")),void P();if(e.matches(".thumbnail"))!function(t){const e=t.closest(".grid-item"),n=e.getAttribute("data-item-idx"),i=!e.classList.contains("checked");u(e,"checked");const o=A.findIndex((t=>t.itemIndex===n));-1!==o&&(A[o].selected=i,R())}(e);else if(e.matches(".yt-info a"))window.open("https://developer.chrome.com/docs/webstore/troubleshooting/#prohibited-products");else{if(e.matches(".changelog-link"))return l({showChangelogLink:!1}),n={url:"views/changelog/index.html"},chrome.tabs.create(n),void g(e);var n;if(e.closest(".accordion-header")){const t=e.closest(".accordion-header"),n=t.closest(".accordion-item").getAttribute("tab-uuid");j(n)?(G(n,!1),u(t.closest(".accordion-item"),"active",!1)):(G(n,!0),u(t.closest(".accordion-item"),"active",!0))}}}})),V(500),function(){var e;!function(){const e=E(".filters");e.addEventListener("change",(t=>{const e=t.target;if(e.matches("select")){if(!e.value)return;if(S[e.id].includes(e.value))return void(e.value="");const t=M(e.value);return e.closest(".label-group").querySelector(".chips").appendChild(t),S[e.id].push(e.value),H(),void(e.value="")}})),e.addEventListener("input",(t=>{const e=t.target;if(e.matches("input"))return e.value?S[e.id]=e.value:S[e.id]=null,void H()})),e.addEventListener("click",(e=>{const n=e.target;if(n.matches(".filters .x-icon.open-filters"))return b(".filters .filters-content"),l({filtersOpen:!0}),void V();if(n.matches(".filters .close-filters"))return g(".filters .filters-content"),l({filtersOpen:!1}),void V();if(n.matches(".filters .reset-filters"))!function(){const e=O();({[t.AUDIO]:["audioType"],[t.IMAGE]:["minWidth","maxWidth","minHeight","maxHeight","imageType"],[t.VIDEO]:["videoQuality","videoType"]})[e].forEach((t=>{S[t]=Array.isArray(S[t])?[]:null})),H(),L()}();else if(n.matches(".chip .x-icon")){const t=n.parentElement.querySelector("span").textContent,e=n.closest(".label-group").querySelector("select").id,i=S[e].indexOf(t);return S[e].splice(i,1),n.parentElement.remove(),void H()}}))}(),e=t=>{Object.keys(t).forEach((e=>{S[e]=t[e]})),L()},a({filters:{}},(({filters:t})=>{t||(t=d.filters),e(t)})),a({filtersOpen:!1},(({filtersOpen:t})=>{(t=>{t?b(".filters .filters-content"):g(".filters .filters-content")})(!!t)}))}(),Z=t=>{t&&b(".changelog-link")},a({showChangelogLink:!1},(({showChangelogLink:t})=>{Z(!!t)})),a({lastOpenSection:t.IMAGE},(({lastOpenSection:t})=>{t||(t=d.lastOpenSection),(t=>{N(t)})(t)}))})();
//# sourceMappingURL=main.bundle.js.map