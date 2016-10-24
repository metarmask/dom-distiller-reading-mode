const fs = require("fs");

const gulp = require("gulp");
const changed = require("gulp-changed");
const replace = require("gulp-replace");
const del = require("del");

const distillerCore = "src/external/chromium/components/dom-distiller/core";
const allChildren = "/**/*"

gulp.task("clean", () => {
   return;
   return del(["out"]);
});

gulp.task("extract:distillerCore", ["clean"], () => {
    return gulp.src([
        distillerCore + "/css" + allChildren,
        distillerCore + "/html" + allChildren,
        distillerCore + "/images" + allChildren,
        distillerCore + "/javascript" + allChildren
    ], {base: distillerCore})
    .pipe(changed("out/dom-distiller"))
    .pipe(gulp.dest("out/dom-distiller"));
});

gulp.task("extract:internal-src", ["clean"], () => {
    return gulp.src(["./**/*", "!./external/**/*"], {base: "./src"})
    .pipe(changed("./out/"))
    .pipe(gulp.dest("./out/"));
});

gulp.task("extract", ["extract:distillerCore", "extract:internal-src"]);

gulp.task("build:dom_distiller_viewer", ["extract"], () => {
    const spinner = fs.readFileSync("out/dom-distiller/images/dom_distiller_material_spinner.svg", "utf8");
    return gulp.src("out/dom-distiller/html/dom_distiller_viewer.html", {base: "./"})
    .pipe(changed("./"))
    .pipe(replace("$6", spinner))
    .pipe(replace("$2", "" +
`<link href="../css/distilledpage.css" rel="stylesheet" type="text/css">
<script src="../javascript/dom_distiller_viewer.js" defer></script>
<script src="../../viewer.js" defer></script>`))
    .pipe(gulp.dest("./"));
});

gulp.task("build:domdistiller", ["extract"], () => {
    const js = fs.readFileSync("src/external/dom-distiller/out/package/js/domdistiller.js", "utf8");
    return gulp.src("out/dom-distiller-dist/js/domdistiller.js", {base: "./"})
    .pipe(changed("./"))
    .pipe(replace(`<include src="../../../../third_party/dom_distiller_js/dist/js/domdistiller.js"/>`, js))
    .pipe(gulp.dest("./"));
});

gulp.task("build", ["build:dom_distiller_viewer", "build:domdistiller"]);
