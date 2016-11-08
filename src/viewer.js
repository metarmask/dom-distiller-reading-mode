/* eslint-disable no-native-reassign, no-global-assign */
/* global addToPage, setTitle, showLoadingIndicator, useTheme, useFontFamily */

// Makes regular text have the regular text size
document.body.style.fontSize = "1.33333333em";

// Has to be synchronous to prevent white flash
document.body.className = `${localStorage["storage-sync-theme"]} ${localStorage["storage-sync-font"]}`;

const baseElement = document.createElement("base");
baseElement.target = "_top";
document.head.appendChild(baseElement);

const oldSetTitle = setTitle;
setTitle = (...args) => {
	window.top.postMessage({action: "setTitle", title: args[0]}, "*");
	oldSetTitle.apply(window, args);
};

function handleOptionsPage() {
	try {
		if(top.location.href === chrome.runtime.getURL("options/options.html")) {
			const script = document.createElement("script");
			script.src = "../../../options/options.js";
			document.head.appendChild(script);
		}
	} catch(error) {
		return false;
	}
}

const messageListener = result => {
	if(result === "want-result") {
		return;
	}
	result = JSON.parse(result);
	const {"1": resultTitle, "2": {"1": resultHTML}} = result;
	addToPage(resultHTML);
	setTitle(resultTitle);
	showLoadingIndicator(true);
	handleOptionsPage();
	chrome.runtime.onMessage.removeListener(messageListener);
};
chrome.runtime.onMessage.addListener(messageListener);
chrome.runtime.sendMessage("want-result");

const storageActions = {
	theme: useTheme,
	font: useFontFamily
};

chrome.storage.onChanged.addListener((changes, area) => {
	if(area === "sync") {
		Object.keys(changes)
		.forEach(key => storageActions[key](changes[key].newValue));
	}
});
