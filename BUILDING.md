# Building

1. Install the Gulp CLI:

		npm install -g gulp-cli

2. Install the dependencies:

		npm install

3. Get the built JavaScript version of DOM Distiller from the dom-distiller-dist repository.

	Navigate to the `src/external` folder and clone the repository:

		git clone https://github.com/chromium/dom-distiller-dist.git

4. Get [the core folder of the Chromium component dom_distiller](https://chromium.googlesource.com/chromium/src/+archive/master/components/dom_distiller/core.tar.gz) and put it into `src/external/chromium/components/dom_distiller/`.

5. Build the project using Gulp:

		gulp build
