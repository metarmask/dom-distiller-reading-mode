document.getElementById(sessionStorage.iframeID).remove();
document.title = sessionStorage.oldTitle;
document.body.setAttribute("style", sessionStorage.oldBodyStyle);
