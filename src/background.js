chrome.runtime.onInstalled.addListener(({reason}) => {
	if(reason === "install") {
		chrome.storage.sync.get({
			theme: "light",
			font: "sans-serif"
		}, items => {
			chrome.storage.sync.set(items);
		});
	}

	// Remove localStorage keys that should not exist
	const badKeys = [];
	for (let i = 0; true; i++) {
		const key = localStorage.key(i);
		if(key === null) {
			break;
		} else if(key.startsWith("result-")) {
			badKeys.push(key);
		}
	}
	badKeys.forEach(key => localStorage.removeItem(key));

	localStorage.removeItem("result-options");

	// Save browser action icon paths to localStorage for faster access
	const manifest = chrome.runtime.getManifest();
	const prefix = "browserActionIcon";
	const inactiveIcon = manifest.browser_action.default_icon;
	localStorage[`${prefix}Inactive`] = JSON.stringify(inactiveIcon);
	const activeIcon = {};
	Object.keys(inactiveIcon).forEach(size => {
		activeIcon[size] = inactiveIcon[size].replace("inactive", "active");
	});
	localStorage[`${prefix}Active`] = JSON.stringify(activeIcon);
});

chrome.browserAction.onClicked.addListener(({id: tabID}) => {
	chrome.tabs.executeScript(tabID, {
		file: "content-scripts/isActive.js"
	}, ([active]) => {
		chrome.tabs.executeScript(tabID, {
			file: `content-scripts/${active ? "remove" : "add"}.js`
		});
		chrome.browserAction.setIcon({
			path: JSON.parse(localStorage[
				active ? "browserActionIconActive" : "browserActionIconInactive"
			]),
			tabId: tabID
		});
	});
});

chrome.storage.onChanged.addListener((changes, area) => {
	Object.keys(changes).forEach(key => {
		localStorage[`storage-${area}-${key}`] = changes[key].newValue;
	});
});
