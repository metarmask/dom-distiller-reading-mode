const msgExpressionStart = "__MSG_";
const msgExpressionEnd = "__";
const msgXPathResult = document.evaluate(
	`//text()[
		starts-with(., "${msgExpressionStart}") and
		(substring(., string-length(.) - string-length("${msgExpressionEnd}") + 1) = "${msgExpressionEnd}")
	]`,
	document,
	null,
	XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE
);

for (let i = 0; i < msgXPathResult.snapshotLength; i++) {
	const textNode = msgXPathResult.snapshotItem(i);
	const messageName = Array.from(textNode.nodeValue).slice(
		msgExpressionStart.length,
		-msgExpressionEnd.length
	)
	.join("");
	textNode.nodeValue = chrome.i18n.getMessage(messageName);
}

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
