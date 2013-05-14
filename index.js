#!/usr/bin/env node
var path = require('path')
var exec = require('child_process').exec
var express = require('express')
var q = require('q')
var optimist = require('optimist')

var getTemplatedTestFile = require('./lib/createTemplate')
var runPhantom = require('./lib/runPhantom')
var config = require('./testamentConfig')
var DEFAULT_CONFIG = path.resolve(path.join(__dirname, 'defaultConfig.json'))

var argv = optimist
  .usage('Run a single test or directory full of tests. Usage: $0 [TEST_PATH]')
  .default({c: DEFAULT_CONFIG, v: false})
  .alias('c', 'config')
  .describe('c', 'pass testament config')
  .alias('v', 'verbose')
  .describe('v', 'print verbose info')
  .argv


var pathToTest = argv._[0]
var config = config(require(argv.config))

if (!pathToTest) {
  console.log('missing path')
  optimist.showHelp()
  process.exit(1)
}

// Some paths to important files. Redefine these to make sense for you
// assume this file is in /node_modules/testament of our app
var testTemplatePath = path.resolve(path.join(__dirname, config.testTemplate))

function handleError(err) {
  console.error("Error running tests:", err.stack)
  process.exit(1)
}

/**
 * Run the tests in pathToTest
 * pathToTest - path to a test file or directory of tests to run
 **/
function runTests(pathToTest) {
  startServer(pathToTest)
    .then(runPhantom())
    .then(reportResults)
    .fail(handleError).done()
}

function startServer(pathToTestFiles) {
  // set up server, and magic template
  var server = express()
  var deferred = q.defer()
  var templatedTestFilePromise = getTemplatedTestFile(pathToTestFiles, testTemplatePath, config.testMount, config.requireModules)
  var templatedTestFile
  var PORT = 3006
  // using the config, and resolve all the paths
  var projectRoot = path.resolve(path.join(__dirname, config.rootDir))
  var publicDir = path.resolve(path.join(projectRoot, config.publicDir))
  var testDir = path.resolve(path.join(projectRoot, config.testDir))

  // mount the two static file servers, giving a namespace to each one!
  server.use(config.publicMount, express.static(publicDir))
  server.use(config.testMount, express.static(testDir))

  var testamentServer = express()
  // override request for actual test runner url so we send back tepmlated tests
  testamentServer.get("/" + config.testJs, function(req, res) {
    res.set('Content-Type', 'text/javascript')
    res.send(templatedTestFile)
  })

  function serveFile(partialPath) {
    var filePath = path.resolve(path.join(__dirname, partialPath))
    return function(req, res) {
      res.sendfile(filePath)
    }
  }
  for (var file in config.testamentFiles) {
    testamentServer.get(file, serveFile(config.testamentFiles[file]))
  }

  server.use(config.testamentMount, testamentServer)
  // install a 404 handler so we can inform the user smartly
  server.use(function(req, res) {
    console.log("had a 404!", req.url)
    res.send("Can't find file!", 404)
  })
  // inform the user and exit when a 500 happens
  server.use(function(err, req, res, next) {
    console.log("Something went wrong in the server!")
    process.exit(1)
  })
  server.listen(PORT, function () {
    templatedTestFilePromise.then(function(t) {
      templatedTestFile = t
      deferred.resolve(PORT)
    }, handleError).done()
  })
  return deferred.promise
}

// results is [err, stdout, stderr] from execing phantomjs
function reportResults(results) {
  console.log(results[1])
  // if mocha exited with an error code
  if (results[0] && results[0].code) {
    // print out stderr
    console.error(results[2])
    process.exit(results[0].code)
  }
  process.exit(0)
}

module.exports = runTests

// if script is being run
if (module === require.main) {
  runTests(pathToTest)
}
