chrome.runtime.onInstalled.addListener(({reason}) => {
	if(reason === "install") {
		chrome.storage.sync.set({
			theme: "light",
			font: "sans-serif"
		});
	}
});

chrome.browserAction.onClicked.addListener(tab => {
	chrome.tabs.executeScript(tab.id, {
		code: "" +
`
var tabID = ${tab.id};
var $$OPTIONS = {};
var $$STRINGIFY = true;
`
	}, () => {
		chrome.tabs.executeScript(tab.id, {
			file: "external/dom-distiller-core/javascript/domdistiller.js"
		}, ([result]) => {
			localStorage[`result-${tab.id}`] = result;
			chrome.tabs.executeScript(tab.id, {
				file: "content-script.js"
			});
		});
	});
});

chrome.storage.onChanged.addListener((changes, area) => {
	Object.keys(changes).forEach(key => {
		localStorage[`storage-${area}-${key}`] = changes[key].newValue;
	});
});
