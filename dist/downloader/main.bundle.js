(()=>{"use strict";var t,e;(e=t||(t={})).IMAGE="image",e.AUDIO="audio",e.VIDEO="video";var n,i,o,c,r=function(t,e,n,i){return new(n||(n=Promise))((function(o,c){function r(t){try{l(i.next(t))}catch(t){c(t)}}function s(t){try{l(i.throw(t))}catch(t){c(t)}}function l(t){var e;t.done?o(t.value):(e=t.value,e instanceof n?e:new n((function(t){t(e)}))).then(r,s)}l((i=i.apply(t,e||[])).next())}))};function s(){return r(this,void 0,void 0,(function*(){var t,e;try{let n={active:!0,lastFocusedWindow:!0},[i]=yield chrome.tabs.query(n);return!(null==i?void 0:i.url)||(null===(t=null==i?void 0:i.url)||void 0===t?void 0:t.startsWith("chrome://"))||(null===(e=null==i?void 0:i.url)||void 0===e?void 0:e.startsWith("https://chromewebstore.google.com"))?null:i}catch(t){return null}}))}function l(t){return r(this,void 0,void 0,(function*(){var e,n;try{const i=yield chrome.tabs.get(t);return chrome.runtime.lastError?(console.error("Error get tab by ID:",chrome.runtime.lastError),null):!(null==i?void 0:i.url)||(null===(e=null==i?void 0:i.url)||void 0===e?void 0:e.startsWith("chrome://"))||(null===(n=null==i?void 0:i.url)||void 0===n?void 0:n.startsWith("https://chromewebstore.google.com"))?null:i}catch(t){return null}}))}function a(t,e){chrome.storage.sync.get(t,e)}function u(t,e){e?chrome.storage.sync.set(t,e):chrome.storage.sync.set(t)}(c=n||(n={})).LIGHT="light",c.DARK="dark",c.SYSTEM="system",(o=i||(i={})).POPUP="popup",o.SIDE_PANEL="side-panel";const d={theme:n.SYSTEM,defaultAction:i.POPUP,previousVersion:null,showChangelogLink:!1,lastOpenSection:t.IMAGE,filters:{},filtersOpen:!1};function h(t,e,n=null){let i=[];i="string"==typeof t?function(t){const e=[],n=document.querySelectorAll(t);return n.forEach((t=>e.push(t))),n}(t):Array.isArray(t)?[...t]:[t],i.length&&(null===n?[...i].forEach((t=>{t.classList.contains(e)?t.classList.remove(e):t.classList.add(e)})):n?[...i].forEach((t=>t.classList.add(e))):[...i].forEach((t=>t.classList.remove(e))))}function f(t,e={},n=[]){const i=document.createElement(t);if(e.class&&("string"==typeof e.class?i.classList.add(e.class):i.classList.add(...e.class)),e.html&&(i.innerHTML=e.html||""),e.attributes)for(const[t,n]of Object.entries(e.attributes))i.setAttribute(t,n);if(e.data)for(const[t,n]of Object.entries(e.data))i.setAttribute(`data-${t}`,n);return e.type&&(i.type=e.type),e.title&&(i.title=e.title),e.alt&&(i.alt=e.alt),e.src&&(i.src=e.src),e.href&&(i.href=e.href),n&&(!Array.isArray(n)&&n instanceof HTMLElement&&(n=[n]),i.append(...n)),i}function p(t={},e=[]){return f("div",t,e)}function m(t={},e=[]){return f("span",t,e)}function v(t={},e=[]){return t.type="button",f("button",t,e)}function g(t={}){return f("img",t)}function b(t,e=24){return m({html:t,class:"x-icon",attributes:{size:e}})}function y(t){const e="string"==typeof t?A(t):t;e&&(e.hidden=!1)}function E(t){const e="string"==typeof t?A(t):t;e&&(e.hidden=!0)}function A(t){return document.querySelector(t)}Object.keys(d);const I=[],T={},x={},w=[],C=(()=>{let t;const e=[];for(let n=0;n<256;n++){t=n;for(let e=0;e<8;e++)t=1&t?3988292384^t>>>1:t>>>1;e[n]=t}return e})();function D(t){return function(t){let e=-1;for(let n=0;n<t.length;n++)e=e>>>8^C[255&(e^t.charCodeAt(n))];return~e>>>0}(t.toString()).toString(16).padStart(8,"0")}function L(){return A(".section-buttons button.selected").getAttribute("data-section")||t.IMAGE}const O={minWidth:null,maxWidth:null,minHeight:null,maxHeight:null,imageType:[],videoQuality:[],videoType:[],audioType:[]};function k(t){return p({class:"chip"},[m({html:t}),b("close")])}function S(){u({filters:O}),console.log({FILTERS:O}),W()}function _(){return O}function M(){return p({class:"thumbnail"})}function $(e,n,i,o){const c=p({class:"accordion-body"});return o?(c.appendChild(p({class:"yt-info"},[m({html:"Note: Chrome Web Store does not allow extensions that download videos from YouTube any longer."}),f("a",{href:"https://developer.chrome.com/docs/webstore/troubleshooting/#prohibited-products",html:"Chrome policy"})])),c.classList.add("restricted")):c.append(...e.sort(((t,e)=>t.order-e.order)).map((e=>function(e){const n=p({class:["grid-item",...e.selected?["checked"]:[]],attributes:{"data-item-idx":e.itemIndex}}),i=v({class:"download_image_button"},b("download")),o=f("a",{attributes:{href:e.src,download:""}},i),c=m({class:"item-details-dimensions"}),r=m({class:"item-details"},[m({class:"item-details-ext",html:e.extension}),c]);let s=null;switch(e.type){case t.IMAGE:c.textContent=`${e.properties.width} x ${e.properties.height}`,s=function(t){const e=M(),n=g({src:t});return e.appendChild(n),e}(e.src);break;case t.AUDIO:c.textContent=e.properties.durationStr,s=function(){const t=M(),e=b("music_note",50);return t.appendChild(e),t}();break;case t.VIDEO:c.textContent=e.properties.quality,s=function(t){const e=M(),n=b("videocam",50),i=g({src:t});return e.appendChild(t?i:n),e}(e.poster)}return n.appendChild(o),n.appendChild(r),s&&n.appendChild(s),n}(e)))),c}function H(e){const{title:n,uuid:i,id:o,favIconUrl:c,isRestricted:r}=e,s=p({class:["accordion-item",...G(i)?["active"]:[]]});s.setAttribute("tab-uuid",i);const l=L(),a=U(i),u=function(e,n){return e===t.IMAGE?function(t){const e=_();return t.filter((t=>{var n;const{width:i,height:o}=t.properties;return!(e.maxWidth&&i>e.maxWidth||e.minWidth&&i<e.minWidth||e.minHeight&&o<e.minHeight||e.maxHeight&&o>e.maxHeight||(null===(n=e.imageType)||void 0===n?void 0:n.length)&&!e.imageType.includes(t.extension))}))}(n):e===t.AUDIO?function(t){const e=_();return t.filter((t=>{var n,i;return!((null===(n=e.videoQuality)||void 0===n?void 0:n.length)&&!e.videoQuality.includes(t.properties.quality)||(null===(i=e.audioType)||void 0===i?void 0:i.length)&&!e.audioType.includes(t.extension))}))}(n):e===t.VIDEO?function(t){const e=_();return t.filter((t=>{var n,i;return!((null===(n=e.videoQuality)||void 0===n?void 0:n.length)&&!e.videoQuality.includes(t.properties.quality)||(null===(i=e.videoType)||void 0===i?void 0:i.length)&&!e.videoType.includes(t.extension))}))}(n):n}(l,a),d=function(t,e,n,i){const o=n===i?`(${n})`:`(${n} / ${i})`;return p({class:"accordion-header"},v({class:"accordion-button"},[g({src:t,class:"favicon",alt:"Favicon"}),m({class:"tab-title"},[m({class:"title",html:e}),m({class:"tab-media-count",html:o})]),m({class:"tab-toggle"})]))}(c,n,u.length,a.length),h=$(u,0,0,r);return s.appendChild(d),s.appendChild(h),s}function U(t){const e=L();let n=I.filter((t=>t.type===e));return t&&(n=n.filter((e=>e.tabUuid===t))),n}function W(){!function(){const t=A(".accordion");t.innerHTML="",w.forEach((e=>{t.appendChild(function(t){const e=p({class:"accordion-group",attributes:{"data-tab-subgroup":t}});return function(t){return Object.values(x).filter((e=>e.id===t))}(t).forEach((t=>{e.appendChild(H(t))})),e}(e))}))}(),A(".count-all").innerHTML=I.length.toString()}function P(t,e){T[t]=e}function G(t){return T[t]}const q=[t.IMAGE,t.AUDIO,t.VIDEO];function R(t){const{checked:e}=t.target;let n=!0,i=!0;const o=U();let c=0;h(".grid-item","checked",e);for(let t=0;t<o.length;t++)o[t].selected=e,o[t].selected?(i=!1,c++):n=!1;B(c);const r=A("#toggle_all_checkbox");r.indeterminate=!(n||i),n?r.checked=!0:i&&(r.checked=!1)}function B(t){var e;A("#download-btn .selected-count").innerHTML=t>0?`(${t})`:"",e=!t,A("#download-btn").disabled=e}function N(e){u({lastOpenSection:e=q.includes(e)?e:t.IMAGE}),h(".section-buttons button","selected",!1),h(`.section-buttons button[data-section="${e}"]`,"selected",!0);const n=A(".filters");n.classList.remove(t.IMAGE,t.AUDIO,t.VIDEO),n.classList.add(e)}function V(t=null){!function(t){r(this,arguments,void 0,(function*(t,e=null){if(!e){const t=yield s();if(!t||!t.id)return;if(t.id<=0)return;e=t.id}yield chrome.scripting.executeScript({target:{tabId:e,allFrames:!0},files:[t]})}))}("/dist/content-script/send_media/send_media.bundle.js",t)}var j;!function(t){t.TAB_CREATED="tabCreated",t.TAB_REPLACED="tabReplaced",t.TAB_UPDATED="tabUpdated",t.TAB_ACTIVATED="tabActivated",t.SEND_MEDIA="sendMedia",t.QUICK_SEND_MEDIA_FOR_DOWNLOAD="quickSendMediaForDownload",t.GET_TAB_INFO="getTabInfo",t.THEME_CHANGED="themeChanged"}(j||(j={}));const F=["https://youtube.com","https://www.youtube.com"];function Q(t){return F.some((e=>t.includes(e)))}function Y(t){const e=t.id,n=D(`${e}-${t.url}`);x[n]={id:e,favIconUrl:t.favIconUrl,url:t.url,title:t.title,isRestricted:Q(t.url),uuid:n},w.includes(e)||w.push(e)}function K(t){return e=this,n=void 0,o=function*(){if(t.error&&Object.keys(t.error).length>0)return void console.log(t);const e=t.tabInfo||(yield s());if(!e)return;Y(e);const n=D(`${e.id}-${e.url}`);if(Q(e.url))return void W();const i=t=>(t.tabId=e.id,t.tabUuid=n,t.itemIndex=`${e.id}-${n}-${t.uuid}`,t);[...t.image.map(i),...t.audio.map(i),...t.video.map(i)].forEach((t=>{I.find((e=>e.itemIndex===t.itemIndex))||I.push(t)})),q.forEach((t=>{const e=I.filter((e=>e.type===t)).length;A(`.section-buttons button[data-section="${t}"] .items-count`).innerHTML=e.toString()})),W()},new((i=void 0)||(i=Promise))((function(t,c){function r(t){try{l(o.next(t))}catch(t){c(t)}}function s(t){try{l(o.throw(t))}catch(t){c(t)}}function l(e){var n;e.done?t(e.value):(n=e.value,n instanceof i?n:new i((function(t){t(n)}))).then(r,s)}l((o=o.apply(e,n||[])).next())}));var e,n,i,o}var z,J=function(t,e,n,i){return new(n||(n=Promise))((function(o,c){function r(t){try{l(i.next(t))}catch(t){c(t)}}function s(t){try{l(i.throw(t))}catch(t){c(t)}}function l(t){var e;t.done?o(t.value):(e=t.value,e instanceof n?e:new n((function(t){t(e)}))).then(r,s)}l((i=i.apply(t,e||[])).next())}))};V(),function(){var t;t=(t,e,n)=>{const{eventName:i,data:o}=t;switch(i){case j.TAB_UPDATED:o.tabId,c=o.changeInfo,Y(r=o.tab),r.active&&"complete"===c.status&&V(r.id);break;case j.TAB_ACTIVATED:!function(t){J(this,void 0,void 0,(function*(){const e=yield l(t);e&&(Y(e),e.active&&V(t))}))}(o.tabId);break;case j.TAB_CREATED:!function(t){Y(t),t.active&&V(t.id)}(o.tab);break;case j.TAB_REPLACED:!function(t){J(this,void 0,void 0,(function*(){const e=yield l(t);e&&(Y(e),e.active&&V(t))}))}(o.tabId);break;case j.SEND_MEDIA:K(o)}var c,r;n(null)},chrome.runtime.onMessage.addListener(t)}(),document.body.addEventListener("click",(t=>{const{target:e}=t;if(e)if(e.closest("#download-btn"))U().filter((t=>t.selected)).forEach((t=>function(t){const e={url:t};chrome.downloads.download(e)}(t.src)));else{if(e.closest(".section-buttons button"))return N(e.closest(".section-buttons button").getAttribute("data-section")),void W();if(e.matches(".thumbnail"))!function(t){const e=t.closest(".grid-item"),n=e.getAttribute("data-item-idx"),i=!e.classList.contains("checked");h(e,"checked");const o=I.findIndex((t=>t.itemIndex===n));if(-1===o)return;I[o].selected=i;let c=!0,r=!0;const s=U();let l=0;for(let t=0;t<s.length;t++)s[t].selected?(r=!1,l++):c=!1;B(l);const a=A("#toggle_all_checkbox");a.indeterminate=!(c||r),c?a.checked=!0:r&&(a.checked=!1)}(e);else if(e.matches(".yt-info a"))window.open("https://developer.chrome.com/docs/webstore/troubleshooting/#prohibited-products");else{if(e.matches(".changelog-link"))return u({showChangelogLink:!1}),n={url:"views/changelog/index.html"},chrome.tabs.create(n),void E(e);var n;if(e.closest(".accordion-header")){const t=e.closest(".accordion-header"),n=t.closest(".accordion-item").getAttribute("tab-uuid");G(n)?(P(n,!1),h(t.closest(".accordion-item"),"active",!1)):(P(n,!0),h(t.closest(".accordion-item"),"active",!0))}}}})),A("#toggle_all_checkbox").addEventListener("change",R),function(){var t;!function(){const t=A(".filters");t.addEventListener("change",(t=>{const e=t.target;if(e.matches("select")){if(!e.value)return;if(O[e.id].includes(e.value))return void(e.value="");const t=k(e.value);return e.closest(".label-group").querySelector(".chips").appendChild(t),O[e.id].push(e.value),S(),void(e.value="")}})),t.addEventListener("input",(t=>{const e=t.target;if(e.matches("input"))return e.value?O[e.id]=e.value:O[e.id]=null,void S()})),t.addEventListener("click",(t=>{const e=t.target;if(e.matches(".filters .x-icon.open-filters"))return y(".filters .filters-content"),void u({filtersOpen:!0});if(e.matches(".filters .close-filters"))return E(".filters .filters-content"),void u({filtersOpen:!1});if(e.matches(".chip .x-icon")){const t=e.parentElement.querySelector("span").textContent,n=e.closest(".label-group").querySelector("select").id,i=O[n].indexOf(t);return O[n].splice(i,1),e.parentElement.remove(),void S()}}))}(),t=t=>{Object.keys(t).forEach((e=>{O[e]=t[e]})),["minWidth","maxWidth","minHeight","maxHeight"].forEach((t=>{const e=A(`input#${t}`),n=O[t];n&&(e.value=n)})),["imageType","videoQuality","videoType","audioType"].forEach((t=>{const e=A(`select#${t}`),n=O[t],i=e.closest(".label-group").querySelector(".chips");n.forEach((t=>{const e=k(t);i.appendChild(e)}))}))},a({filters:{}},(({filters:e})=>{e||(e=d.filters),t(e)})),a({filtersOpen:!1},(({filtersOpen:t})=>{(t=>{t?y(".filters .filters-content"):E(".filters .filters-content")})(!!t)}))}(),z=t=>{t&&y(".changelog-link")},a({showChangelogLink:!1},(({showChangelogLink:t})=>{z(!!t)})),a({lastOpenSection:t.IMAGE},(({lastOpenSection:t})=>{t||(t=d.lastOpenSection),(t=>{N(t)})(t)}))})();
//# sourceMappingURL=main.bundle.js.map