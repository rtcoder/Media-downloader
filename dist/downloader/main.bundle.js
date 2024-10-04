(()=>{"use strict";var t=function(t,e,n,o){return new(n||(n=Promise))((function(i,c){function a(t){try{s(o.next(t))}catch(t){c(t)}}function r(t){try{s(o.throw(t))}catch(t){c(t)}}function s(t){var e;t.done?i(t.value):(e=t.value,e instanceof n?e:new n((function(t){t(e)}))).then(a,r)}s((o=o.apply(t,e||[])).next())}))};function e(){return t(this,void 0,void 0,(function*(){var t,e;try{let n={active:!0,lastFocusedWindow:!0},[o]=yield chrome.tabs.query(n);return console.log("current tabUrl: ",null==o?void 0:o.url,o),!(null==o?void 0:o.url)||(null===(t=null==o?void 0:o.url)||void 0===t?void 0:t.startsWith("chrome://"))||(null===(e=null==o?void 0:o.url)||void 0===e?void 0:e.startsWith("https://chromewebstore.google.com"))?null:o}catch(t){return null}}))}function n(e){return t(this,void 0,void 0,(function*(){var t,n;try{const o=yield chrome.tabs.get(e);return chrome.runtime.lastError?(console.error("Error get tab by ID:",chrome.runtime.lastError),null):(console.log("tabUrl: ",null==o?void 0:o.url),!(null==o?void 0:o.url)||(null===(t=null==o?void 0:o.url)||void 0===t?void 0:t.startsWith("chrome://"))||(null===(n=null==o?void 0:o.url)||void 0===n?void 0:n.startsWith("https://chromewebstore.google.com"))?null:o)}catch(t){return null}}))}function o(t,e,n=null){let o=[];o="string"==typeof t?function(t){const e=[],n=document.querySelectorAll(t);return n.forEach((t=>e.push(t))),n}(t):Array.isArray(t)?[...t]:[t],o.length&&(null===n?[...o].forEach((t=>{t.classList.contains(e)?t.classList.remove(e):t.classList.add(e)})):n?[...o].forEach((t=>t.classList.add(e))):[...o].forEach((t=>t.classList.remove(e))))}function i(t,e={},n=[]){const o=document.createElement(t);if(e.class&&("string"==typeof e.class?o.classList.add(e.class):o.classList.add(...e.class)),e.html&&(o.innerHTML=e.html||""),e.attributes)for(const[t,n]of Object.entries(e.attributes))o.setAttribute(t,n);if(e.data)for(const[t,n]of Object.entries(e.data))o.setAttribute(`data-${t}`,n);return e.type&&(o.type=e.type),e.title&&(o.title=e.title),e.alt&&(o.alt=e.alt),e.src&&(o.src=e.src),n&&(!Array.isArray(n)&&n instanceof HTMLElement&&(n=[n]),o.append(...n)),o}function c(t={},e=[]){return i("div",t,e)}function a(t={},e=[]){return i("span",t,e)}function r(t={},e=[]){return t.type="button",i("button",t,e)}function s(t={}){return i("img",t)}function l(t,e=24){return a({html:t,class:"x-icon",attributes:{size:e}})}function d(t){return document.querySelector(t)}const u=[],h={},f={},m=(()=>{let t;const e=[];for(let n=0;n<256;n++){t=n;for(let e=0;e<8;e++)t=1&t?3988292384^t>>>1:t>>>1;e[n]=t}return e})();function b(t){return function(t){let e=-1;for(let n=0;n<t.length;n++)e=e>>>8^m[255&(e^t.charCodeAt(n))];return~e>>>0}(t.toString()).toString(16).padStart(8,"0")}function g(){return c({class:"thumbnail"})}function v(t,e){const{src:n,alt:o,poster:d,type:u,selected:h,filetype:f}=t,m=c({class:["grid-item",...h?["checked"]:[]],attributes:{"data-src-dw":n,"data-filename":(null==o?void 0:o.length)?o:"","data-item-idx":e,"data-type":u}}),b=r({class:"download_image_button"},l("download")),v=i("a",{attributes:{href:t.src,download:t.alt||""}},b),p=a({class:"item-details"},[a({class:"item-details-ext",html:f}),a({class:"item-details-dimensions"})]);let y=null;switch(u){case"image":y=function(t){const e=g(),n=s({src:t});return e.appendChild(n),e}(n);break;case"audio":y=function(t){const e=g(),n=l("music_note",50),o=i("audio",{src:t});return e.appendChild(n),e.appendChild(o),e}(n);break;case"video":y=function(t,e){const n=g(),o=l("videocam",50),c=s({src:e}),a=i("video",{src:t,poster:e});return n.appendChild(e?c:o),n.appendChild(a),n}(n,d)}m.appendChild(v),m.appendChild(p),y&&(m.appendChild(y),function(t,e){switch(e){case"image":(i=t.querySelector("img")).addEventListener("load",(()=>{const t=i.naturalWidth.toString(),e=i.naturalHeight.toString(),n=i.closest(".grid-item");null==n||n.setAttribute("original-width",t),null==n||n.setAttribute("original-height",e)}));break;case"audio":(n=t.querySelector("audio")).addEventListener("loadedmetadata",(()=>{const t=function(t){const e=Math.floor(t%60),n=Math.floor(t%3600/60),o=Math.floor(t/3600),i=e<10?`0${e}`:e,c=n<10?`0${n}`:n;return o>0?`${o}:${c}:${i}`:`${c}:${i}`}(n.duration),e=n.closest(".grid-item");null==e||e.setAttribute("audio-duration",t),n.remove()}));break;case"video":(o=t.querySelector("video")).addEventListener("loadedmetadata",(()=>{const t=(e=o.videoWidth)>=3840?"4K":e>=2560?"1440p":e>=1920?"1080p":e>=1280?"720p":e>=854?"480p":e>=640?"360p":"SD";var e;const n=o.closest(".grid-item");null==n||n.setAttribute("video-quality",t),o.remove()}))}var n,o,i}(y,u));const A=new MutationObserver((t=>{t.forEach((t=>{"attributes"===t.type&&function(t,e,n){const o=t.querySelector(".item-details").querySelector(".item-details-dimensions"),i=t.getAttribute("audio-duration"),c=t.getAttribute("original-width"),a=t.getAttribute("original-height"),r=t.getAttribute("video-quality");switch(console.log({duration:i,width:c,height:a,quality:r}),e){case"audio":o.textContent=i,i&&n.disconnect();break;case"image":o.textContent=`${c} x ${a}`,c&&a&&n.disconnect();break;case"video":o.textContent=r,r&&n.disconnect()}}(m,u,A)}))}));return A.observe(m,{attributes:!0,attributeFilter:["audio-duration","video-quality","original-width","original-height"]}),m}function p(t){const{title:e,uuid:n,id:o,favIconUrl:l,isRestricted:d}=f[t.tabUuid],u=c({class:["accordion-item",...h[n]?["active"]:[]]});u.setAttribute("tab-uuid",n);const m=(b=l,g=e,p=t.items.length,c({class:"accordion-header"},r({class:"accordion-button"},[s({src:b,class:"favicon",alt:"Favicon"}),a({class:"tab-title"},[a({class:"title",html:g}),a({class:"tab-media-count",html:`(${p})`})]),a({class:"tab-toggle"})])));var b,g,p;const y=function(t,e,n,o){const r=c({class:"accordion-body"});return o?(r.appendChild(c({class:"yt-info"},[a({html:"Note: Chrome Web Store does not allow extensions that download videos from YouTube any longer."}),i("a",{href:"https://developer.chrome.com/docs/webstore/troubleshooting/#prohibited-products",html:"Chrome policy"})])),r.classList.add("restricted")):r.append(...t.map((t=>v(t,`${e}-${n}-${t.uuid}`)))),r}(t.items,o,n,d);return u.appendChild(m),u.appendChild(y),u}function y(){const t=d(".section-buttons button.selected").getAttribute("data-section")||"image";return u.map((e=>{const n=e.elements.map((({media:e,tabUuid:n})=>{const o=(e=>e[t].map((e=>function(t,e){const{src:n,uuid:o,poster:i,type:c,selected:a,alt:r}=t;return{src:n,uuid:o,poster:i,filetype:c,selected:a,type:e,alt:r}}(e,t))))(e);return{tabUuid:n,items:o}}));return{tabId:e.tabId,data:n}}))}function A(){const t=y();console.log(t),function(t){const e=d(".accordion");e.innerHTML="",t.forEach((t=>{e.appendChild(function(t){const e=c({class:"accordion-group",attributes:{"data-tab-subgroup":t.tabId}});return t.data.forEach((t=>{e.appendChild(p(t))})),e}(t))}))}(t),d(".count-all").innerHTML=function(t){return t.reduce(((t,e)=>t+e.data.reduce(((t,e)=>t+e.items.length),0)),0)}(t).toString()}function w(t,e){h[t]=e}function E(t){!function(t,e=null){const n={url:t};e&&(n.filename=e),chrome.downloads.download(n)}(t.url,t.alt)}const k=["image","audio","video"];function C(t){const{checked:e}=t.target;let n=!0,i=!0;const c=y();let a=0;o(".grid-item","checked",e);for(let t=0;t<c.length;t++){const{data:o}=c[t];for(let t=0;t<o.length;t++){const{items:c}=o[t];for(let t=0;t<c.length;t++)c[t].selected=e,c[t].selected?(i=!1,a++):n=!1}}L(a);const r=d("#toggle_all_checkbox");r.indeterminate=!(n||i),n?r.checked=!0:i&&(r.checked=!1)}function L(t){var e;d("#download-btn .selected-count").innerHTML=t>0?`(${t})`:"",e=!t,d("#download-btn").disabled=e}function I(n=null){!function(n){t(this,arguments,void 0,(function*(t,n=null){if(!n){const t=yield e();if(!t||!t.id)return;if(t.id<=0)return;n=t.id}yield chrome.scripting.executeScript({target:{tabId:n,allFrames:!0},files:[t]})}))}("/dist/content-script/send_media.bundle.js",n)}var T;!function(t){t.TAB_CREATED="tabCreated",t.TAB_REPLACED="tabReplaced",t.TAB_UPDATED="tabUpdated",t.TAB_ACTIVATED="tabActivated",t.SEND_MEDIA="sendMedia"}(T||(T={}));const x=["https://youtube.com","https://www.youtube.com"];function $(t){return x.some((e=>t.includes(e)))}var _,S,D=function(t,e,n,o){return new(n||(n=Promise))((function(i,c){function a(t){try{s(o.next(t))}catch(t){c(t)}}function r(t){try{s(o.throw(t))}catch(t){c(t)}}function s(t){var e;t.done?i(t.value):(e=t.value,e instanceof n?e:new n((function(t){t(e)}))).then(a,r)}s((o=o.apply(t,e||[])).next())}))};I(),function(){var t;t=t=>{const{eventName:o,data:i}=t;switch(console.log(o,i),o){case T.TAB_UPDATED:i.tabId,c=i.changeInfo,(a=i.tab).active&&"complete"===c.status&&I(a.id);break;case T.TAB_ACTIVATED:!function(t){D(this,void 0,void 0,(function*(){const e=yield n(t);e&&e.active&&I(t)}))}(i.tabId);break;case T.TAB_CREATED:!function(t){t.active&&I(t.id)}(i.tab);break;case T.TAB_REPLACED:!function(t){D(this,void 0,void 0,(function*(){const e=yield n(t);e&&e.active&&I(t)}))}(i.tabId);break;case T.SEND_MEDIA:!function(t){D(this,void 0,void 0,(function*(){if(t.error&&Object.keys(t.error).length>0)return void console.log(t);const n=yield e();n&&(k.filter((e=>!!t[e])).forEach((e=>{const o={image:[],video:[],audio:[]};t[e].filter((t=>!o[e].includes(t))),$(n.url)||t[e].forEach((t=>o[e].push(t)));const i=b(`${n.id}-${n.url}`);let c=u.findIndex((({tabId:t})=>t===n.id));-1===c&&(u.push({tabId:n.id,elements:[]}),c=u.length-1);const a=u[c].elements.findIndex((t=>t.tabUuid===i));if(function(t){const e=b(`${t.id}-${t.url}`);f[e]={id:t.id,favIconUrl:t.favIconUrl,url:t.url,title:t.title,isRestricted:$(t.url),uuid:e}}(n),-1===a)u[c].elements.push({media:o,tabUuid:i});else{const{media:t}=u[c].elements[a];k.forEach((e=>{var n;u[c].elements[a].media[e]=(n=[...t[e],...o[e]],[...new Map(n.map((t=>[t.src,t]))).values()])}))}u.forEach((t=>{t.elements.forEach((t=>w(t.tabUuid,!1)))})),w(i,!0)})),A())}))}(i)}var c,a},chrome.runtime.onMessage.addListener(t)}(),document.body.addEventListener("click",(t=>{const{target:e}=t;if(e)if(e.closest("#download-btn"))!function(t){const e=[];for(let n=0;n<t.length;n++){const{data:o}=t[n];for(let t=0;t<o.length;t++){const{items:n}=o[t];for(let t=0;t<n.length;t++)n[t].selected&&e.push({url:n[t].src,alt:n[t].alt})}}e.forEach(E)}(y());else{if(e.closest(".section-buttons button"))return n=e.closest(".section-buttons button").getAttribute("data-section"),n=k.includes(n)?n:"image",o(".section-buttons button","selected",!1),o(`.section-buttons button[data-section="${n}"]`,"selected",!0),void A();var n;if(e.matches(".thumbnail"))!function(t){const e=t.closest(".grid-item"),n=e.getAttribute("data-item-idx"),i=e.getAttribute("data-type"),c=!e.classList.contains("checked");o(e,"checked");const[a,r,s]=n.split("-"),l=function(t){return"image"===t?"image":"video"===t?"video":"audio"}(i),h=u.findIndex((({tabId:t})=>t===+a)),f=u[h].elements.findIndex((t=>t.tabUuid===r));if(-1===f)return;u[h].elements[f].media[l][+s].selected=c;let m=!0,b=!0;const g=y();let v=0;console.log(n,c);for(let t=0;t<g.length;t++){const{data:e}=g[t];for(let t=0;t<e.length;t++){const{items:n}=e[t];for(let t=0;t<n.length;t++)n[t].selected?(b=!1,v++):m=!1}}L(v);const p=d("#toggle_all_checkbox");p.indeterminate=!(m||b),m?p.checked=!0:b&&(p.checked=!1)}(e);else if(e.matches(".yt-info a"))window.open("https://developer.chrome.com/docs/webstore/troubleshooting/#prohibited-products");else{if(e.matches(".changelog-link"))return c={showChangelogLink:!1},chrome.storage.sync.set(c),i={url:"views/changelog.html"},chrome.tabs.create(i),void function(t){const e="string"==typeof t?d(t):t;e&&(e.hidden=!0)}(e);var i,c;e.closest(".accordion-header")&&o(e.closest(".accordion-header").closest(".accordion-item"),"active")}}})),d("#toggle_all_checkbox").addEventListener("change",C),_={showChangelogLink:!1},S=t=>{t.showChangelogLink&&function(t){const e=d(t);e&&(e.hidden=!1)}(".changelog-link")},chrome.storage.sync.get(_,S)})();
//# sourceMappingURL=main.bundle.js.map