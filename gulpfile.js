/* eslint-env node */
const optional = require("optional");

const gulp = require("gulp");
const replace = require("gulp-replace");
const svg2PNG = optional("gulp-svg2png");
const rename = require("gulp-rename");
const util = require("gulp-util");

const del = require("del");
const streamToPromise = require("stream-to-promise");
const vinylFS = require("vinyl-fs");

/* Paths */
const allInside = "/**/*";
const transparentPixel = "transparent-pixel.png";
const srcFolder = "src";
const srcIcons = `${srcFolder}/icons`;
const srcManifest = `${srcFolder}/manifest.json`;
const srcExternal = `${srcFolder}/external`;
const inactiveIcon = `${srcIcons}/browserAction/inactive.svg`;
const distillerJS = `${srcExternal}/dom-distiller/out/domdistiller.js`;

const distillerCore = `${srcExternal}/chromium/src/components/dom_distiller/core`;
const distillerCoreViewerHTML = `${distillerCore}/html/dom_distiller_viewer.html`;
const distillerCoreWrapper = `${distillerCore}/javascript/domdistiller.js`;
const distillerCoreSpinner = `${distillerCore}/images/dom_distiller_material_spinner.svg`;
const chromiumLicense = `${srcExternal}/chromium/LICENSE`;

const outFolder = "out";
const outExternal = `${outFolder}/external`;
const outDistillerCore = `${outExternal}/dom-distiller-core`;

function walkPairs(object, pairStep) {
	Object.keys(object).forEach(key => {
		pairStep(key, object[key]);
		if(object[key] instanceof Object) {
			walkPairs(object[key], pairStep);
		}
	});
}

gulp.task("clean", () => {
	return del(["out"]);
});

gulp.task("build", ["clean"], () => {
	return Promise.all([
		streamToPromise(
			gulp.src(
				[
					`${distillerCore}/css${allInside}`,
					`${distillerCore}/images${allInside}`,
					`${distillerCore}/html${allInside}`,
					`${distillerCore}/javascript${allInside}`
				].concat([
					// Except
					distillerCoreViewerHTML,
					distillerCoreSpinner,
					distillerCoreWrapper
				].map(s => `!${s}`)),
				{base: distillerCore}
			)
			.pipe(gulp.dest(outDistillerCore))
		),
		streamToPromise(
			gulp.src(chromiumLicense)
			.pipe(gulp.dest(outDistillerCore))
		),
		streamToPromise(
			gulp.src(
				[
					srcFolder + allInside
				].concat([
					// Except
					srcExternal,
					srcExternal + allInside,
					srcIcons,
					srcIcons + allInside
				].map(s => `!${s}`)),
				{base: srcFolder}
			)
			.pipe(vinylFS.symlink(outFolder, {relative: true}))
		),
		(() => {
			const convertions = [];
			const addConvertion = ({svgPath, pngPath, size, afterSrc}) => {
				const first = gulp.src(svgPath, {base: srcFolder})
				.pipe(afterSrc ? afterSrc : util.noop())
				.pipe(gulp.dest(outFolder));
				let second;
				if(svg2PNG) {
					second = first.pipe(svg2PNG({width: size, height: size}));
				} else {
					second = gulp.src(transparentPixel);
				}
				convertions.push(streamToPromise(
					second.pipe(rename(pngPath))
					.pipe(gulp.dest(outFolder))
				));
			};
			const svgToPNGPathRegex = /(.+?\.svg)-(\d+)\.png/;
			gulp.src(srcManifest)
			.on("data", ({contents: manifest}) => {
				manifest = JSON.parse(manifest.toString());
				walkPairs(manifest, (key, value) => {
					if(typeof value === "string") {
						const match = value.match(svgToPNGPathRegex);
						if(match) {
							const [pngPath, svgPath, size] = match;
							const svgPathInSrc = `${srcFolder}/${svgPath}`;
							if(svgPathInSrc === inactiveIcon) {
								addConvertion({
									svgPath: svgPathInSrc,
									pngPath: pngPath.replace("inactive", "active"),
									size,
									afterSrc: replace(`fill="#9c27b0"`, `fill="#ff4081"`)
								});
							}
							addConvertion({
								svgPath: svgPathInSrc,
								pngPath,
								size
							});
						}
					}
				});
			});
			return Promise.all(convertions);
		})(),
		new Promise((resolve, reject) => {
			// Replace parts of the wrapper script with the real distiller
			const wrapperSource = gulp.src(
				distillerCoreWrapper,
				{base: distillerCore}
			);
			wrapperSource.pause();
			const distSource = gulp.src(distillerJS);
			distSource.on("data", ({contents: dist}) => {
				streamToPromise(
					wrapperSource
					.pipe(replace(/\n}\)\([\D\d]+/, "\n})({}, true);\n"))
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
