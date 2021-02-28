((ls) => {
  'use strict';

  const defaults = {columns:4};

  for (const option in defaults) {
    if (ls[option] === undefined) {
      ls[option] = defaults[option];
    }
    ls[option + '_default'] = defaults[option];
  }

  ls.options = JSON.stringify(Object.keys(defaults));
})(localStorage);
