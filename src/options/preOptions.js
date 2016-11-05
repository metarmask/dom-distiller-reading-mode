"use strict";

/* global distill */
/* eslint-disable no-unused-vars */
const tabID = "options";
const $$MANUAL = true;
const $$OPTIONS = {};
const $$STRINGIFY = true;

document.addEventListener("DOMContentLoaded", () => {
	const distillerWrapper = document.createElement("script");
	distillerWrapper.src = "../external/dom-distiller-core/javascript/domdistiller.js";
	distillerWrapper.addEventListener("load", () => {
		localStorage["result-options"] = distill({}, true);
		const contentScript = document.createElement("script");
		contentScript.src = "../content-script.js";
		document.head.appendChild(contentScript);
	});
	document.head.appendChild(distillerWrapper);
});
