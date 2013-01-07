var path = require('path')
var express = require('express')
var q = require('q')
var getTemplatedTestFile = require('./lib/createTemplate')

var argv = require('optimist')
  .usage('Run a single test or directory fill of tests. Usage: $0 [TEST_PATH]')
  .argv

var pathToTest = argv._[0]

function handleError(err) {
  console.error("Error running tests:", err.stack)
  process.exit(1)
}

function runTests(pathToTest) {
  startServer(__dirname, pathToTest, path.join(__dirname, 'testRunnerTemplate.hbs'))
    .then(runPhantom)
    .then(reportResults)
    .fail(handleError).done()
}

function startServer(staticFilePath, pathToTestFiles, pathToTestTemplate) {
  // set up server, and magic template
  var server = express()
  var deferred = q.defer()
  var templatedTestFilePromise = getTemplatedTestFile(pathToTestFiles, pathToTestTemplate)
  var templatedTestFile
  var PORT = 3006
  server.use(express.static(staticFilePath))

  // override request for actual test runner url so we send back tepmlated tests
  server.get('test/public/allTests.js', function(req, res) {
    res.set('Content-Type', 'text/javascript')
    res.send(templatedTestFile)
  })

  server.listen(PORT)
  console.log('listening!')
  server.on('listening', function() {
    templatedTestFilePromise.then(function(t) {
      console.log('wut wut is this?')
      templatedTestFile = t
      deferred.resolve(PORT)
    }, handleError).done()
    console.log('listening fired')
  })
  return deferred.promise
}

function runPhantom(port) {
  return port
  // Start mocha-phantomjs in a subprocess
  // pipe output to stdout
  // return the statuscode?
}

function reportResults(results) {
  console.log('results are', results)
  process.exit(0)
}

runTests(pathToTest)

/*
 * GAMEPLAN
 * Figure out files to load
 * Start up a static file server
 * The JS file is actually a template
 * serve everything static, but the JS file. When it is requested, template
 * out the files
 *
 * Start server
 * Start mocha-phantomjs
 * When mocha-phantomjs ends, pipe output, and just exit
 */
