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

## Roadmap
* Support other test runners
* Support arbitrary templates
