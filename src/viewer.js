/* global addToPage */
const result = JSON.parse(localStorage["result_" + location.hash.substr(1)]);
addToPage(result[2][1]);

console.log("Hi!");
