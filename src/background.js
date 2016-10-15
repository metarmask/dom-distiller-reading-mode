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
			file: "dom-distiller/javascript/domdistiller.js"
		}, ([result]) => {
			localStorage["result_" + tab.id] = result;
			console.log("here");
			chrome.tabs.executeScript(tab.id, {
				file: "content-script.js"
			});
		});
	});
});
