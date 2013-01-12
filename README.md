#Testament

A server for running entire suites or single tests of RequireJS tests in
mocha-phantomjs.

Right now to run a test suite in phantomjs with requirejs you need to manually
enter all the tests scripts into an HTML file and run that. This is unweildy
and is an extra step that can be forgotten or discourage developers from writing
tests.

The problem is still present with requirejs, since if your test suites are
modules, you have to manually require the modules to make the tests run.

Testament is a small app that takes in a path to a test or folder containing
tests and will automatically fill out your test-runner file so that specific
test, or directory of tests will be run in Mocha-phantomjs.

## Installation

Testament depends on
[mocha-phantomjs](https://github.com/metaskills/mocha-phantomjs) being installed
and in your path already. See the docs for installation instructions.

```bash
npm install testament
```

## Useage

Testament makes lots of assumptions.

* The tests are AMD modules which mock their dependencies with
  [Squire.js](https://github.com/iammerrick/Squire.js)
* The tests all return their Squire object so the test runner can listen on
  Squire's onRequired callback

You can change some of these assumptions by editing the testRunnerTemplate.hbs
or changing the variables in index.js.

If everything is set up correctly, run testament by pointing it to a file or
directory containing tests.

```bash
node_modules/testament/index.js test/public/models/
```

This will expect all files in the test/public/models directory to be javascript
tests, and attempt to run them all. You should see the mocha output in your
console.

## TODO
* Support other test runners
* Support arbitrary templates
* Make it not so weirdly specific to our project
