/* global applyDistiller */
"use strict";
const existingIframe = document.querySelector("iframe#dom-distiller-result-iframe");
if(existingIframe) {
    existingIframe.remove();
} else {
    const distilled = applyDistiller({}, false);
    const iframe = document.createElement("iframe");
    iframe.src = chrome.runtime.getURL("dom-distiller/html/dom_distiller_viewer.html");
    iframe.style.zIndex = 100000000;
    iframe.style.position = "fixed";
    iframe.style.left = 0;
    iframe.style.right = 0;
    iframe.style.top = 0;
    iframe.style.bottom = 0;
    iframe.style.margin = "auto";
    iframe.style.width = "100vw";
    iframe.style.height = "100vh";
    iframe.style.background = "white";
    document.documentElement.appendChild(iframe);
    window.addEventListener("message", ({data, origin}) => {
        console.log(origin);
        console.log("got", data);
        iframe.contentWindow.postMessage(distilled, "chrome-extension://jgbjkkmiimdimcpabiipganibdiloakg");
    });
}
