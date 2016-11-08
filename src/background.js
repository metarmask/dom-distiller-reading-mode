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

	// Save browser action icon paths to localStorage for faster access
	const prefix = "browserActionIcon";
	const inactiveIcon = manifest.browser_action.default_icon;
	localStorage[`${prefix}Inactive`] = JSON.stringify(inactiveIcon);
	const activeIcon = {};
	Object.keys(inactiveIcon).forEach(size => {
		activeIcon[size] = inactiveIcon[size].replace("inactive", "active");
	});
	localStorage[`${prefix}Active`] = JSON.stringify(activeIcon);
	localStorage.removeItem("result-options");
});

chrome.browserAction.onClicked.addListener(({id: tabID}) => {
	chrome.tabs.executeScript(tabID, {
		file: "content-scripts/isActive.js"
	}, ([active]) => {
		if(active) {
			chrome.tabs.executeScript(tabID, {
				file: "content-scripts/remove.js"
			});
			chrome.browserAction.setIcon({
				path: JSON.parse(localStorage.browserActionIconInactive),
				tabId: tabID
			});
		} else {
			chrome.tabs.executeScript(tabID, {
				file: "external/dom-distiller-core/javascript/domdistiller.js"
			}, ([result]) => {
				localStorage[`result-${tabID}`] = result;
				chrome.tabs.executeScript(tabID, {
					file: "content-scripts/add.js"
				});
			});
			chrome.browserAction.setIcon({
				path: JSON.parse(localStorage.browserActionIconActive),
				tabId: tabID
			});
		}
	});
});

chrome.storage.onChanged.addListener((changes, area) => {
	Object.keys(changes).forEach(key => {
		localStorage[`storage-${area}-${key}`] = changes[key].newValue;
	});
});

chrome.runtime.onMessage.addListener((message, sender) => {
	if(message === "want-result") {
		if("tab" in sender) {
			chrome.tabs.sendMessage(sender.tab.id, localStorage[`result-${sender.tab.id}`]);
			localStorage.removeItem(`result-${sender.tab.id}`);
		} else {
			chrome.runtime.sendMessage(localStorage["result-options"]);
		}
	}
});
