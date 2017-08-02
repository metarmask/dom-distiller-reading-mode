/* eslint-env node */
const del            = require("del");
const Gulp           = require("gulp"                 );
const changedInPlace = require("gulp-changed-in-place");
const rename         = require("gulp-rename"          );
const replace        = require("gulp-replace"         );
const pStream        = require("stream-to-promise"    );
const streamToBuffer = require("vinyl-buffer"         );

const optional = require ("optional"    );
const svg2PNG  = optional("gulp-svg2png");

const paths = {
	chromeDDCore: "src/external/chromium/src/components/dom_distiller/core"
};

const internalSubstitutionRegex = /\$\$\((.+?)\)/g;
const internalSubstitutions = {
	CHROME_DD_CORE: paths.chromeDDCore.replace(/^src\//, "")
};

// `Gulp.src(...).pipe(changedInPlace({firstPass: true}))`
// but doesn't buffer before change check
function srcChanged(...args) {
	if(typeof args[args.length - 1] !== "object") {
		args.push({});
	}
	args[args.length - 1].buffer = false;
	return Gulp.src(...args)
	       .pipe(changedInPlace({
				firstPass: true,
				howToDetermineDifference: "modification-time"
			}))
	       .pipe(streamToBuffer());
}

Gulp.task("simple internal resources", () =>
	srcChanged("src/{!(external),!(external)/**/*}", {ignore: "src/icons/**/*.svg"})
	.pipe(replace(internalSubstitutionRegex, (_, name) => {
		if(name in internalSubstitutions) {
			return internalSubstitutions[name];
		} else {
			throw new Error("Unknown substitution: \"" + name + "\"");
		}
	}))
	.pipe(Gulp.dest("out"))
);

Gulp.task("simple external resources", () =>
	Gulp.src(
		"src/external/chromium/src/" +
		"{" +
			"LICENSE," +

			"components/dom_distiller/core/" +
			"{" +
				"css/distilledpage.css," +

				"javascript/dom_distiller_viewer.js" +
			"}" +
		"}",
		{base: "src"}
	)
	.pipe(Gulp.dest("out"))
);

Gulp.task("viewer HTML substitution", async () => {
	/*
		Placeholders (used, $n, description)
		  | $1 | <title>
		x | $2 | CSS (not in tag)
		x | $3 | Body `class` attribute
		  | $4 | <noscript> title
		  | $5 | <noscript> content
		x | $6 | SVG spinner
		  | $7 | `data-original-url` attribute for close link
		  | $8 | Close link content
	*/
	const spinner = pStream(Gulp.src(
		paths.chromeDDCore + "/images/dom_distiller_material_spinner.svg"
	));
	const viewerHTMLSource = Gulp.src(
		paths.chromeDDCore + "/html/dom_distiller_viewer.html", {base: "src"}
	);
	await pStream(
		viewerHTMLSource
		.pipe(replace(
			"$2",

			`<link rel="stylesheet" href="../css/distilledpage.css">` + "\n" +
			`<script src="../javascript/dom_distiller_viewer.js" defer></script>` + "\n" +
			`<script src="../../../../../../../viewer.js" defer></script>`
		))
		.pipe(replace("$3", "light sans-serif"))
		.pipe(replace("$6", (await spinner)[0].contents.toString()))
		.pipe(Gulp.dest("out"))
	)
});

Gulp.task("distiller wrapper substitution", async () => {
	const builtJS = pStream(Gulp.src(
		"src/external/dom-distiller/out/domdistiller.js"
	));
	// Split into multiple statements because `await builtJS`
	const wrapperSource = Gulp.src(
		paths.chromeDDCore + "/javascript/domdistiller.js",
		{base: "src"}
	);
	await pStream(
		wrapperSource
		.pipe(replace(
			/<include src=".+?domdistiller.js"\/>/,
			(await builtJS)[0].contents.toString()
		))
		.pipe(replace("})($$OPTIONS, $$STRINGIFY)", "})({}, false)"))
		.pipe(Gulp.dest("out"))
	);
});

Gulp.task("external substitution", Gulp.parallel(
	"viewer HTML substitution",
	"distiller wrapper substitution"
));

const svgPNGPathRegex = /(.+?\.svg)-(\d+)\.png/;
Gulp.task("SVG convertion", async () => {
	const [{contents: manifest}] = await pStream(Gulp.src("src/manifest.json"));
	const svgs = new Map();
	JSON.parse(manifest.toString(), (key, value) => {
		if(typeof value === "string") {
			const match = value.match(svgPNGPathRegex);
			if(!match) return value;
			const [, svgPath, size] = match;
			if(!svgs.has(svgPath)) svgs.set(svgPath, {
				sizes: new Set(),
				src: srcChanged("src/" + svgPath)
			});
			svgs.get(svgPath).sizes.add(size);
		}
		return value;
	});
	{
		// Generate active icon from inactive
		const [path, {sizes, src}] =
			[...svgs]
		    .find(([k]) => k.endsWith("inactive.svg"));
		const activePath = path.replace("inactive.svg", "active.svg");
		svgs.set(activePath, {
			sizes,
			// Reusing `src` here causes both to be replaced (!?)
			src: Gulp.src("src/" + path)
			     .pipe(replace(`fill="#9c27b0"`, `fill="#ff4081"`))
		});
	}
	const promises = [];
	for(const [path, {sizes, src}] of svgs) {
		for(const size of sizes) {
			let start;
			if(svg2PNG) {
				start = src
				        .pipe(svg2PNG({width: size, height: size}));
			} else {
				start = Gulp.src("transparent-pixel.png");
			}
			promises.push(pStream(
				start
				.pipe(rename(`${path}-${size}.png`))
				.pipe(Gulp.dest(`out`))
			));
		}
	}
	await Promise.all(promises);
});

Gulp.task("clean", () => {
	return del(["out"]);
});

Gulp.task("build", Gulp.series(
	"clean",
	Gulp.parallel(
		"simple internal resources",
		"simple external resources",
		"external substitution",
		"SVG convertion"
	)
));

Gulp.task("watch", async () => {
	console.info("Watching SVG files in src/icons");
	Gulp.watch(
		["src/icons/**/*.svg"],
		Gulp.parallel("SVG convertion")
	);
	console.info("Watching all non-SVG files in src excluding src/external");
	Gulp.watch(
		"src/{!(external),!(external)/**/*}", {ignored: "src/icons/**/*.svg"},
		Gulp.parallel("simple internal resources")
	);
	await new Promise(resolve => {});
});

Gulp.task("default", Gulp.series("build", "watch"));
