sessionStorage.oldTitle = document.title;

addEventListener("message", ({data, origin}) => {
	if(origin !== `chrome-extension://${chrome.runtime.id}`) {
		return;
	}
	if(data.action === "setTitle") {
		document.title = data.title;
	}
});

{
	const iframe = document.createElement("iframe");
	iframe.addEventListener("load", () => {
		iframe.contentWindow.focus();
	});
	iframe.id = sessionStorage.iframeID;
	iframe.src = chrome.runtime.getURL("external/dom-distiller-core/html/dom_distiller_viewer.html");

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
