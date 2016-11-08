
function onOptionsResultLoaded() {
	const contentScript = document.createElement("script");
	contentScript.src = "../content-scripts/add.js";
	document.head.appendChild(contentScript);
}

if(localStorage["result-options"]) {
	onOptionsResultLoaded();
} else {
	let iframe;
	Promise.all([
		fetch("../external/dom-distiller-core/javascript/domdistiller.js")
		.then(response => response.text()),
		new Promise(resolve => document.addEventListener("DOMContentLoaded", resolve))
	])
	.then(([domDistillerJS]) => {
		iframe = document.createElement("iframe");
		iframe.src = URL.createObjectURL(new Blob([`
			${document.body.innerHTML}
			<script type="text/plain">${domDistillerJS}</script>
			<script>top.postMessage({
					action: "options-distilled",
					result: eval(document.querySelector("script").textContent)
				},
				"chrome-extension://${chrome.runtime.id}"
			)</script>
		`], {type: "text/html"}));
		document.head.appendChild(iframe);
	});


	addEventListener("message", ({origin, data}) => {
		if(origin === location.origin && data.action === "options-distilled") {
			localStorage["result-options"] = data.result;
			onOptionsResultLoaded();
			iframe.remove();
		}
	});
}
