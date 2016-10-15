/* global tabID */
"use strict";
const existingIframe = document.querySelector("iframe#dom-distiller-result-iframe");
if(existingIframe) {
    existingIframe.remove();
} else {
    const iframe = document.createElement("iframe");
    iframe.src = chrome.runtime.getURL("dom-distiller/html/dom_distiller_viewer.html") + "#" + tabID;
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
