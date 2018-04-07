# Building
1. Fetch and checkout submodules:

       git submodule update --init --depth 1 src/external/chromium/src
       git submodule update --init           src/external/dom-distiller

2. Change working directory to the DOM distiller repository:

       cd src/external/dom-distiller

3. Install Vagrant and do:

       vagrant up && vagrant ssh

4. Build the DOM Distiller JavaScript:

       cd /vagrant &&
       ant extractjs &&
       exit

       If the build fails due to lack of memory, run the commands again.

5. Change working directory to the project root:

       cd ../../..

5. Install NPM dependencies:

       npm install

6. Run Gulp:

       ./node_modules/.bin/gulp
