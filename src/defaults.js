((ls) => {
  'use strict';

  // One-time reset of settings
  chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
      // Open the options page after install
      chrome.tabs.create({url: '/views/options.html'});
    } else if (
        details.reason === 'update' &&
        /^(((0|1)\..*)|(2\.(0|1)(\..*)?))$/.test(details.previousVersion)
    ) {
      // Clear data from versions before 2.1
      ls.clear();
    }
  });

  // Popup
  const defaults = {columns: 2};

  for (const option in defaults) {
    if (ls[option] === undefined) {
      ls[option] = defaults[option];
    }
    ls[option + '_default'] = defaults[option];
  }

  ls.options = JSON.stringify(Object.keys(defaults));
})(localStorage);
