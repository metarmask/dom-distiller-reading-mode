/* global addToPage */

// Makes regular text have the regular text size
document.body.style.fontSize = "1.33333333em";
const result = JSON.parse(localStorage["result_" + location.hash.substr(1)]);
addToPage(result[2][1]);
