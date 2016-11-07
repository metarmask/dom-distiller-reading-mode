/* global tabID */
"use strict";

window.iframeID = "dom-distiller-result-iframe";
window.existingIframe = document.getElementById(window.iframeID);
if(window.existingIframe) {
	chrome.runtime.sendMessage({active: false});

	window.existingIframe.remove();
	if("old" in window) {
		document.title = window.old.title;
		document.body.setAttribute("style", window.old.bodyStyle);
	}
} else {
	chrome.runtime.sendMessage({active: true});

	window.addEventListener("message", ({data, origin}) => {
		if(origin === `chrome-extension://${chrome.runtime.id}`) {
			if(data.action) {
				switch(data.action) {
				case "setTitle":
					document.title = data.title;
					break;
				}
			}
		}
	});

	window.old = {
		title: document.title,
		bodyStyle: document.body.getAttribute("style")
	};
	document.body.setAttribute("style", "display: none !important");

	const iframe = document.createElement("iframe");
	iframe.addEventListener("load", () => {
		iframe.contentWindow.focus();
	});
	iframe.id = window.iframeID;
	iframe.src = `${chrome.runtime.getURL("external/dom-distiller-core/html/dom_distiller_viewer.html")}#${tabID}`;

	const style = {
		zIndex: 100000000,
		position: "fixed",
		left: 0,
		right: 0,
		top: 0,
		bottom: 0,
		margin: "auto",
		width: "100vw",
		height: "100vh",
		background: "white",
		border: "none"
	};
	Object.keys(style).forEach(property => {
		iframe.style[property] = style[property];
	});

	document.documentElement.appendChild(iframe);
}
