const gulp = require("gulp");
const replace = require("gulp-replace");

const del = require("del");
const streamToPromise = require("stream-to-promise");
const vinylFS = require("vinyl-fs");

/* Paths */
const allInside = "/**/*";
const srcFolder = "src";
const srcExternal = srcFolder + "/external";
const distillerDistJS = srcExternal + "/dom-distiller-dist/js/domdistiller.js";

const distillerCore = srcExternal + "/chromium/components/dom_distiller/core";
const distillerCoreViewerHTML = distillerCore + "/html/dom_distiller_viewer.html";
const distillerCoreWrapper = distillerCore + "/javascript/domdistiller.js";
const distillerCoreSpinner = distillerCore + "/images/dom_distiller_material_spinner.svg";

const outFolder = "out";
const outExternal = outFolder + "/external";
const outDistillerCore = outExternal + "/dom-distiller-core";

gulp.task("clean", () => {
	return del(["out"]);
});

gulp.task("build", ["clean"], () => {
	return Promise.all([
		streamToPromise(
			gulp.src(
				[
					distillerCore + "/css" + allInside,
					distillerCore + "/images" + allInside,
					distillerCore + "/html" + allInside,
					distillerCore + "/javascript" + allInside,
				].concat([
					// Except
					distillerCoreViewerHTML,
					distillerCoreSpinner,
					distillerCoreWrapper
				].map(s => "!" + s)),
				{base: distillerCore}
			)
			.pipe(gulp.dest(outDistillerCore))
		),
		streamToPromise(
			gulp.src(
				[
					srcFolder + allInside
				].concat([
					// Except
					srcExternal + allInside
				].map(s => "!" + s)),
				{base: srcFolder}
			)
			.pipe(vinylFS.symlink(outFolder, {relative: true}))
		),
		new Promise((resolve, reject) => {
			// Replace parts of the wrapper script with the real distiller
			const wrapperSource = gulp.src(
				distillerCoreWrapper,
				{base: distillerCore}
			);
			wrapperSource.pause();
			const distSource = gulp.src(distillerDistJS);
			distSource.on("data", ({contents: dist}) => {
				streamToPromise(
					wrapperSource
					.pipe(replace(/^\(function\(/m, "function distill("))
					.pipe(replace(/^}\)\(/m, "" + `
}
((...args) => {
	if(!window.$$MANUAL) {
		distill(...args);
	}
})(`))
					.pipe(replace(
						`<include src="../../../../third_party/dom_distiller_js/dist/js/domdistiller.js"/>`,
						dist.toString()
					))
					.pipe(gulp.dest(outDistillerCore))
				).then(resolve, reject);
				wrapperSource.resume();
			});
		}),
		new Promise((resolve, reject) => {
			const viewerHTMLSource = gulp.src(
				distillerCoreViewerHTML,
				{base: distillerCore}
			);
			viewerHTMLSource.pause();
			const spinnerSource = gulp.src(distillerCoreSpinner);
			spinnerSource.on("data", ({contents: spinner}) => {
				streamToPromise(
					viewerHTMLSource.pipe(replace("$6", spinner.toString()))
					.pipe(replace("$2", `<link href="../css/distilledpage.css" rel="stylesheet" type="text/css">
<script src="../javascript/dom_distiller_viewer.js" defer></script>
<script src="../../../viewer.js" defer></script>`))
					.pipe(gulp.dest(outDistillerCore))
				).then(resolve, reject);
				viewerHTMLSource.resume();
			});
		})
	]);
});

gulp.task("default", ["build"]);
