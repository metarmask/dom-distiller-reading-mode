/* global tabID */
"use strict";
const existingIframe = document.querySelector("iframe#dom-distiller-result-iframe");
if(existingIframe) {
    existingIframe.remove();
} else {
    const iframe = document.createElement("iframe");
    iframe.src = chrome.runtime.getURL("dom-distiller/html/dom_distiller_viewer.html") + "#" + tabID;
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
}
