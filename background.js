chrome.browserAction.onClicked.addListener(tab => {
	chrome.tabs.executeScript(tab.id, {
		file: "page/dom-distiller.js"
	}, () => {
		chrome.tabs.executeScript(tab.id, {
			file: "page/page.js"
		});
	});
});
