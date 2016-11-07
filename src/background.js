chrome.runtime.onInstalled.addListener(({reason}) => {
	if(reason === "install") {
		chrome.storage.sync.get({
			theme: "light",
			font: "sans-serif"
		}, items => {
			chrome.storage.sync.set(items);
		});
	}
	const manifest = chrome.runtime.getManifest();
	// Save browser action icon paths to localStorage
	const inactiveIcon = manifest.browser_action.default_icon;
	localStorage.browserActionIconInactive = JSON.stringify(inactiveIcon);
	const activeIcon = {};
	Object.keys(inactiveIcon).forEach(size => {
		activeIcon[size] = inactiveIcon[size].replace("inactive", "active");
	});
	localStorage.browserActionIconActive = JSON.stringify(activeIcon);
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

chrome.runtime.onMessage.addListener((message, {tab: {id: tabId}}) => {
	if("active" in message) {
		chrome.browserAction.setIcon({
			path: JSON.parse(localStorage[
				message.active ? "browserActionIconActive" : "browserActionIconInactive"
			]),
			tabId
		});
	}
});
