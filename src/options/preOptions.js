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

// After distillation
setTimeout(() => {
	const contentScript = document.createElement("script");
	contentScript.src = "../content-scripts/add.js";
	document.head.appendChild(contentScript);
}, 0)
