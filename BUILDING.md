# Building
1. Fetch and checkout submodules:

       git submodule update --init --depth 1 --recursive

2. Change working directory to the DOM distiller repository:

       cd src/external/dom-distiller

3. Follow the instructions for "Developing with Vagrant" in [the DOM Distiller README](src/external/dom-distiller/README.md).

4. Build the DOM Distiller JavaScript:

       cd /vagrant &&
       ant extractjs &&
       exit

5. Change working directory to the project root:

       cd ../../..

5. Install NPM dependencies:

       npm install

6. Run Gulp:

       ./node_modules/gulp/bin/gulp.js
