"use strict";
/* global distill */
/* eslint-disable no-unused-vars */
var tabID = "options";
var $$MANUAL = true;
var $$OPTIONS = {};
var $$STRINGIFY = true;

document.addEventListener("DOMContentLoaded", () => {
	const distillerWrapper = document.createElement("script");
	distillerWrapper.src = "../external/dom-distiller-core/javascript/domdistiller.js";
	distillerWrapper.addEventListener("load", () => {
		localStorage["result_options"] = distill({}, true);
		const contentScript = document.createElement("script");
		contentScript.src = "../content-script.js";
		document.head.appendChild(contentScript);
	});
	document.head.appendChild(distillerWrapper);
});
