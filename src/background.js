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
