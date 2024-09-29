// Apply the saved theme or system theme when the extension loads
import {ThemeType} from './storage/storage-def';
import {getStorageThemeValue} from './storage/storage-fn';

getStorageThemeValue(applyTheme);

function getBrowserTheme() {
  const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
  return isDarkMode ? ThemeType.DARK : ThemeType.LIGHT;
}

function applyTheme(theme: ThemeType) {
  document.body.classList.remove('light-theme', 'dark-theme');

  if (theme === ThemeType.LIGHT) {
    document.body.classList.add('light-theme');
  } else if (theme === ThemeType.DARK) {
    document.body.classList.add('dark-theme');
  } else if (theme === ThemeType.SYSTEM) {
    const systemTheme = getBrowserTheme();
    document.body.classList.add(`${systemTheme}-theme`);
  }
}
