/* eslint-disable no-native-reassign, no-global-assign */
/* global addToPage, setTitle, showLoadingIndicator, useTheme, useFontFamily */

// Makes regular text have the regular text size
document.body.style.fontSize = "1.33333333em";

document.body.className = "light sans-serif";

const oldSetTitle = setTitle;
setTitle = (...args) => {
	window.top.postMessage({action: "setTitle", title: args[0]}, "*");
	oldSetTitle.apply(window, args);
};

const storageKey = `result-${location.hash.substr(1)}`;
const result = JSON.parse(localStorage[storageKey]);
const [, resultTitle, [, resultHTML]] = result;
localStorage.removeItem(storageKey);
addToPage(resultHTML);
setTitle(resultTitle);
showLoadingIndicator(true);

chrome.storage.sync.get({theme: "light", font: "sans-serif"}, ({theme, font}) => {
	useTheme(theme);
	useFontFamily(font);
});
