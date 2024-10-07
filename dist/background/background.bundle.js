(()=>{"use strict";var e,n,t,o,i;(i=e||(e={})).IMAGE="image",i.AUDIO="audio",i.VIDEO="video",(o=n||(n={})).LIGHT="light",o.DARK="dark",o.SYSTEM="system",function(e){e.POPUP="popup",e.SIDE_PANEL="side-panel"}(t||(t={}));const r={theme:n.SYSTEM,defaultAction:t.POPUP,previousVersion:null,showChangelogLink:!1,lastOpenSection:e.IMAGE,filters:{},filtersOpen:!1};Object.keys(r);var a;function c(e,n){chrome.storage.sync.get(e,n)}function d(e,n){n?chrome.storage.sync.set(e,n):chrome.storage.sync.set(e)}function s(e,n=null,t){t||(t=e=>{});try{chrome.runtime.sendMessage({eventName:e,data:n},t)}catch(e){}}function u(e){c({defaultAction:t.POPUP},(({defaultAction:n})=>{n||(n=r.defaultAction),e(n)}))}!function(e){e.TAB_CREATED="tabCreated",e.TAB_REPLACED="tabReplaced",e.TAB_UPDATED="tabUpdated",e.TAB_ACTIVATED="tabActivated",e.SEND_MEDIA="sendMedia",e.QUICK_SEND_MEDIA_FOR_DOWNLOAD="quickSendMediaForDownload",e.GET_TAB_INFO="getTabInfo"}(a||(a={}));var l;function h(e){u((n=>{switch(n){case t.POPUP:chrome.action.openPopup(undefined);break;case t.SIDE_PANEL:!function(e){chrome.sidePanel.open(e)}({windowId:e.windowId})}}))}function v(){const e="/views/downloader.html";u((n=>{const o=n===t.SIDE_PANEL,i=n===t.POPUP?e:"",r=o?e:"";var a;a={openPanelOnActionClick:o},chrome.sidePanel.setPanelBehavior(a).catch((e=>console.log(e))),function(e){chrome.sidePanel.setOptions(e)}({path:r}),function(e){chrome.action.setPopup(e)}({popup:i})}))}l=(e,n,t)=>{v(),s(a.TAB_UPDATED,{tabId:e,changeInfo:n,tab:t})},chrome.tabs.onUpdated.addListener(l),chrome.tabs.onActivated.addListener((e=>{v(),s(a.TAB_ACTIVATED,{tabId:e.tabId})})),chrome.tabs.onReplaced.addListener((e=>{v(),s(a.TAB_REPLACED,{tabId:e})})),chrome.tabs.onCreated.addListener((e=>{v(),s(a.TAB_CREATED,{tab:e})})),chrome.action.onClicked.addListener((e=>{v(),h(e)})),chrome.runtime.onInstalled.addListener((e=>{var n;v(),n={id:"openMediaDownloader",title:"Open Media Downloader",contexts:["page"]},chrome.contextMenus.create(n),function(e){if("update"!==e.reason)return;const n=chrome.runtime.getManifest().version;var t;t=e=>{e!==n&&d({showChangelogLink:!0}),d({previousVersion:n})},c({previousVersion:null},(({previousVersion:e})=>{e||(e=r.previousVersion),t(e)}))}(e)})),chrome.contextMenus.onClicked.addListener(((e,n)=>{n&&((e,n)=>{"openMediaDownloader"===e.menuItemId&&h(n)})(e,n)})),function(e){chrome.runtime.onMessage.addListener(e)}(((e,n,t)=>{return o=void 0,i=void 0,c=function*(){var o;if(!(null===(o=n.tab)||void 0===o?void 0:o.id))return t(null),!0;if(e.eventName===a.GET_TAB_INFO){const e=yield function(e){return n=this,t=void 0,i=function*(){var n,t;try{const o=yield chrome.tabs.get(e);return chrome.runtime.lastError?(console.error("Error get tab by ID:",chrome.runtime.lastError),null):!(null==o?void 0:o.url)||(null===(n=null==o?void 0:o.url)||void 0===n?void 0:n.startsWith("chrome://"))||(null===(t=null==o?void 0:o.url)||void 0===t?void 0:t.startsWith("https://chromewebstore.google.com"))?null:o}catch(e){return null}},new((o=void 0)||(o=Promise))((function(e,r){function a(e){try{d(i.next(e))}catch(e){r(e)}}function c(e){try{d(i.throw(e))}catch(e){r(e)}}function d(n){var t;n.done?e(n.value):(t=n.value,t instanceof o?t:new o((function(e){e(t)}))).then(a,c)}d((i=i.apply(n,t||[])).next())}));var n,t,o,i}(n.tab.id);return t(e),!0}},new((r=void 0)||(r=Promise))((function(e,n){function t(e){try{d(c.next(e))}catch(e){n(e)}}function a(e){try{d(c.throw(e))}catch(e){n(e)}}function d(n){var o;n.done?e(n.value):(o=n.value,o instanceof r?o:new r((function(e){e(o)}))).then(t,a)}d((c=c.apply(o,i||[])).next())}));var o,i,r,c}))})();
//# sourceMappingURL=background.bundle.js.map