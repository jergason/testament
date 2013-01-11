var path = require('path')
var exec = require('child_process').exec
var express = require('express')
var q = require('q')
var getTemplatedTestFile = require('./lib/createTemplate')

var argv = require('optimist')
  .usage('Run a single test or directory fill of tests. Usage: $0 [TEST_PATH]')
  .argv

// Some paths to important files. Redefine these to make sense for you
// assume this file is in /node_modules/testament of our app
var baseDir = path.resolve(path.join(__dirname, '../../'))
var testTemplatePath = path.resolve(path.join(__dirname, 'testRunnerTemplate.hbs'))
var testHtmlPath = 'node_modules/testament/TestRunner.html'
var testRunnerFile = '/node_modules/testament/allTests.js'

var pathToTest = argv._[0]

function handleError(err) {
  console.error("Error running tests:", err.stack)
  process.exit(1)
}

/**
 * Run the tests in pathToTest
 * pathToTest - path to a test file or directory of tests to run
 * baseDir - the path that that will be served by web server. test file paths
 *   will be relative to this path
 * testTemplatePath - the location of the template file to put the tests in
 * testHtmlPath - the location of the mocha test runner file
 **/
function runTests(pathToTest, baseDir, testTemplatePath, testHtmlPath) {
  startServer(baseDir, pathToTest, testTemplatePath, testHtmlPath)
    .then(runPhantom(testHtmlPath))
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
  server.get(testRunnerFile, function(req, res) {
    console.log('testRunner requested!')
    res.set('Content-Type', 'text/javascript')
    res.send(templatedTestFile)
  })

  server.listen(PORT, function () {
    templatedTestFilePromise.then(function(t) {
      templatedTestFile = t
      deferred.resolve(PORT)
    }, handleError).done()
  })
  return deferred.promise
}

function runPhantom(testFile) {
  return function(PORT) {
    var deferred = q.defer()
    var phantom = exec('mocha-phantomjs ' + 'http://localhost:'+ PORT + '/' + testFile, function(err, stdout, stderr) {
      deferred.resolve([err, stdout, stderr])
    })
    return deferred.promise
  }
}

function reportResults(results) {
  console.log(results[1])
  // if mocha exited with an error code
  if (results[0] && results[0].code) {
    process.exit(results[0].code)
  }
  process.exit(0)
}

runTests(pathToTest, baseDir, testTemplatePath, testHtmlPath)
