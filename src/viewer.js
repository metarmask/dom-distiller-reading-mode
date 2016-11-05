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
const {"1": resultTitle, "2": {"1": resultHTML}} = result;
localStorage.removeItem(storageKey);
addToPage(resultHTML);
setTitle(resultTitle);
showLoadingIndicator(true);

const storageActions = {
	theme: useTheme,
	font: useFontFamily
};
chrome.storage.sync.get({theme: "light", font: "sans-serif"}, items => {
	Object.keys(items)
	.forEach(key => storageActions[key](items[key]));
});

chrome.storage.onChanged.addListener((changes, area) => {
	if(area === "sync") {
		Object.keys(changes)
		.forEach(key => storageActions[key](changes[key].newValue));
	}
});

if(storageKey === "result-options") {
	const script = document.createElement("script");
	script.src = "../../../options/options.js";
	document.head.appendChild(script);
}
