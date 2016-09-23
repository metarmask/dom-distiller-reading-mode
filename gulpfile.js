const gulp = require("gulp");
const replace = require("gulp-replace");

const distillerCore = "src/external/chromium/components/dom-distiller/core";
const allChildren = "/**/*"

gulp.task("extract", () => {
    gulp.src([
        distillerCore + "/css" + allChildren,
        distillerCore + "/html" + allChildren,
        distillerCore + "/images" + allChildren,
        distillerCore + "/javascript" + allChildren
    ], {base: distillerCore}).pipe(gulp.dest("out/dom-distiller"));
});
